import fs from 'fs'
import path from 'path'

import spawn from 'cross-spawn'
import EventSource from 'eventsource'
import expect from 'expect'
import rimraf from 'rimraf'
import temp from 'temp'
import kill from 'tree-kill'

import cli from '../../src/cli'

const States = {
  INIT: 'INIT',
  INIT_OK: 'INIT_OK',
  CHANGED_FILE: 'CHANGED_FILE',
  REBUILDING: 'REBUILDING',
}

// XXX Dev serving is now done with webpack-dev-server - this will need to be
//     rewriten to do whatever its own HMR client does.
describe.skip('command: serve', function() {
  this.timeout(90000)

  describe('serving a new React app with hot reloading', () => {
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
          if (state === States.INIT && /Compiled successfully/.test(data)) {
            state = States.INIT_OK
            startHMRClient()
          }
        })

        // Fail if there's any error logging
        server.stderr.on('data', data => {
          done(new Error(`stderr output received: ${data}`))
        })

        function startHMRClient() {
          hmrClient = new EventSource('http://localhost:3000/__webpack_hmr')

          // Change a file to trigger a reload after the HMR client connects
          hmrClient.onopen = () => {
            console.log('HMR open: changing file in 5s')
            setTimeout(() => {
              state = States.CHANGED_FILE
              let content = fs.readFileSync('./src/App.js', 'utf-8')
              fs.writeFileSync('./src/App.js', content.replace('Welcome to', 'Change'))
            }, 5000)
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
            console.log(`HMR message: ${data.action}; state=${state}`)
            if (data.action === 'building') {
              if (state === States.CHANGED_FILE) {
                state = States.REBUILDING
              }
            }
            else if (data.action === 'built') {
              if (state === States.REBUILDING) {
                buildResults = data
                done()
              }
            }
            else if (data.action === 'sync') {
              // pass
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
