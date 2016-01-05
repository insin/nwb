import fs from 'fs'
import path from 'path'

import {spawn} from 'cross-spawn'
import EventSource from 'eventsource'
import expect from 'expect'
import rimraf from 'rimraf'
import temp from 'temp'
import kill from 'tree-kill'

const States = {
  INIT: 'INIT',
  INIT_OK: 'INIT_OK',
  REBUILDING: 'REBUILDING'
}

describe('command: serve', function() {
  this.timeout(60000)

  describe('serving a new React app with hot reloading', () => {
    let cli = require('../../src/cli')
    let originalCwd
    let tmpDir
    let server
    let hmrClient

    let state = States.INIT
    let buildResults

    before(done => {
      originalCwd = process.cwd()
      tmpDir = temp.mkdirSync('nwb-test')
      process.chdir(tmpDir)
      cli(['new', 'react-app', 'test-app'], err => {
        expect(err).toNotExist('No errors creating new React app')
        process.chdir(path.join(tmpDir, 'test-app'))

        // Spawn an `nwb serve` child process
        server = spawn('node', [path.join(__dirname, '../../lib/bin/nwb.js'), 'serve'])

        // Start the HMR EventSource client when the initial build completes
        server.stdout.on('data', data => {
          console.log(`server stdout: ${data}`)
          if (state === States.INIT && /webpack built \w+ in \d+ms/.test(data)) {
            state = States.INIT_OK
            startHMRClient()
          }
        })

        // Fail if there's any error logging
        server.stderr.on('data', data => {
          console.log(`server stderr: ${data}`)
          done(new Error(`stderr output received: ${data}`))
        })

        function startHMRClient() {
          hmrClient = new EventSource('http://localhost:3000/__webpack_hmr')

          // Change a file to trigger a reload after the HMR client connects
          hmrClient.onopen = () => {
            console.log('HMR open: changing file in .5s')
            setTimeout(() => {
              let content = fs.readFileSync('./src/App.js', 'utf-8')
              fs.writeFileSync('./src/App.js', content.replace('Welcome to', 'Change'))
            }, 500)
          }

          // Fail on EventSource errors
          hmrClient.onerror = err => {
            done(new Error(`HMR client error: ${err}`))
          }

          hmrClient.onmessage = e => {
            if (e.data === '\uD83D\uDC93') {
              return
            }

            let data = JSON.parse(e.data)
            console.log(`HMR message: ${data.action}`)
            if (data.action === 'building') {
              if (state !== States.INIT_OK) {
                done(new Error(`HMR client unexpectedly received building message; state=${state}`))
              }
              state = States.REBUILDING
            }
            else if (data.action === 'built') {
              if (state !== States.REBUILDING) {
                done(new Error(`HMR client unexpectedly received built message; state=${state}`))
              }
              buildResults = data
              done()
            }
            else {
              done(new Error(`HMR client received unexpected message: ${e.data}`))
            }
          }
        }
      })
    })

    after(done => {
      process.chdir(originalCwd)
      hmrClient.close()
      kill(server.pid, 'SIGKILL', err => {
        if (err) return done(err)
        rimraf(tmpDir, err => {
          done(err)
        })
      })
    })

    it('sends HMR built status without errors or warnings', () => {
      expect(buildResults.warnings).toEqual([])
      expect(buildResults.errors).toEqual([])
    })
  })
})
