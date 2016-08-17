import {execSync} from 'child_process'
import fs from 'fs'
import path from 'path'

import copyTemplateDir from 'copy-template-dir'
import spawn from 'cross-spawn'
import EventSource from 'eventsource'
import expect from 'expect'
import glob from 'glob'
import rimraf from 'rimraf'
import temp from 'temp'
import kill from 'tree-kill'

import cli from '../../src/cli'

let stripHashes = (files) => files.map(file => file.replace(/\.\w{8}\./, '.'))

const States = {
  INIT: 'INIT',
  INIT_OK: 'INIT_OK',
  CHANGED_FILE: 'CHANGED_FILE',
  REBUILDING: 'REBUILDING',
}

describe('sample projects', function() {
  this.timeout(90000)

  describe('async-await project', () => {
    let originalCwd
    let originalNodeEnv
    let tmpDir

    before(done => {
      originalCwd = process.cwd()
      originalNodeEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      tmpDir = temp.mkdirSync('async-await')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/async-await'), tmpDir, {}, (err) => {
        if (err) return done(err)
        process.chdir(tmpDir)
        execSync('npm install', {stdio: 'inherit'})
        done()
      })
    })

    after(done => {
      process.chdir(originalCwd)
      process.env.NODE_ENV = originalNodeEnv
      rimraf(tmpDir, err => {
        done(err)
      })
    })

    it('builds successfully', done => {
      cli(['build'], err => {
        expect(err).toNotExist()
        done()
      })
    })

    it('tests successfully', done => {
      cli(['test'], err => {
        expect(err).toNotExist()
        done()
      })
    })
  })

  describe('Express middleware project', () => {
    let server
    let tmpDir
    let hmrClient

    let state = States.INIT
    let buildResults

    before(done => {
      process.env.NWB_EXPRESS_MIDDLEWARE = require.resolve('../../express')
      tmpDir = temp.mkdirSync('express-middleware')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/express-middleware'), tmpDir, {}, err => {
        if (err) return done(err)

        execSync('npm install', {cwd: tmpDir, stdio: 'inherit'})

        server = spawn('node', ['server.js'], {cwd: tmpDir})

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
          console.log(`server stderr: ${data}`)
          done(new Error(`stderr output received: ${data}`))
        })

        function startHMRClient() {
          hmrClient = new EventSource('http://localhost:3001/__webpack_hmr')

          // Change a file to trigger a reload after the HMR client connects
          hmrClient.onopen = () => {
            console.log('HMR open: changing file in 5s')
            setTimeout(() => {
              state = States.CHANGED_FILE
              let content = fs.readFileSync(path.join(tmpDir, 'src/App.js'), 'utf-8')
              fs.writeFileSync(path.join(tmpDir, 'src/App.js'), content.replace('Welcome to', 'Change'))
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
      if (hmrClient) {
        hmrClient.close()
      }
      if (server) {
        kill(server.pid, 'SIGKILL', err => {
          if (err) return done(err)
          rimraf(tmpDir, done)
        })
      }
      else {
        rimraf(tmpDir, done)
      }
    })

    it('handles hot reloading with webpack', () => {
      expect(buildResults.warnings).toEqual([])
      expect(buildResults.errors).toEqual([])
    })
  })

  describe('cherry-pick project', () => {
    let es5
    let es6
    let originalCwd
    let originalNodeEnv
    let tmpDir

    before(done => {
      originalCwd = process.cwd()
      originalNodeEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      tmpDir = temp.mkdirSync('cherry-pick')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/cherry-pick'), tmpDir, {}, err => {
        if (err) return done(err)
        process.chdir(tmpDir)
        execSync('npm install', {stdio: 'inherit'})
        cli(['build'], err => {
          expect(err).toNotExist()
          es5 = fs.readFileSync(path.join(tmpDir, 'lib/index.js'), 'utf-8')
          es6 = fs.readFileSync(path.join(tmpDir, 'es/index.js'), 'utf-8')
          done()
        })
      })
    })

    after(done => {
      process.chdir(originalCwd)
      process.env.NODE_ENV = originalNodeEnv
      rimraf(tmpDir, err => {
        done(err)
      })
    })

    it('ES5 build transpiles to a cherry-picked version', () => {
      expect(es5)
        .toInclude("require('react-bootstrap/lib/Col')")
        .toInclude("require('react-bootstrap/lib/Grid')")
        .toInclude("require('react-bootstrap/lib/Row')")
    })
    it('ES5 build has propType declarations wrapped in an environment check', () => {
      expect(es5).toInclude('process.env.NODE_ENV !== "production" ? CherryPicker.propTypes')
    })
    it('ES5 build includes a CommonJS interop export', () => {
      expect(es5).toInclude("module.exports = exports['default']")
    })
    it('ES5 build ignores co-located test files and directories', () => {
      expect(glob.sync('*', {cwd: path.resolve('lib')})).toEqual([
        'index.js',
      ])
    })
    it('ES6 modules build transpiles to a cherry-picked version', () => {
      expect(es6)
        .toInclude("import _Col from 'react-bootstrap/lib/Col'")
        .toInclude("import _Grid from 'react-bootstrap/lib/Grid'")
        .toInclude("import _Row from 'react-bootstrap/lib/Row'")
    })
    it('ES6 module build has propType declarations wrapped in an environment check', () => {
      expect(es6).toInclude('process.env.NODE_ENV !== "production" ? CherryPicker.propTypes')
    })
    it('ES6 module build ignores co-located test files and directories', () => {
      expect(glob.sync('*', {cwd: path.resolve('es')})).toEqual([
        'index.js',
      ])
    })
  })

  describe('router-app project', function() {
    this.timeout(120000)

    let originalCwd
    let originalNodeEnv
    let tmpDir

    before(done => {
      originalCwd = process.cwd()
      originalNodeEnv = process.env.NODE_ENV
      console.log(originalNodeEnv)
      delete process.env.NODE_ENV
      tmpDir = temp.mkdirSync('router-app')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/router-app'), tmpDir, {}, err => {
        if (err) return done(err)
        process.chdir(tmpDir)
        execSync('npm install', {stdio: 'inherit'})
        cli(['build'], err => {
          expect(err).toNotExist()
          done()
        })
      })
    })

    after(done => {
      process.chdir(originalCwd)
      process.env.NODE_ENV = originalNodeEnv
      rimraf(tmpDir, err => {
        done(err)
      })
    })

    it('creates split bundles, vendor bundles, copies public subdirs and includes font resources', () => {
      let files = stripHashes((glob.sync('**/*', {cwd: path.resolve('dist')}))).sort()
      expect(files).toEqual([
        '0.js',
        '0.js.map',
        '1.js',
        '1.js.map',
        'app.css',
        'app.css.map',
        'app.js',
        'app.js.map',
        'favicon.ico',
        'glyphicons-halflings-regular.eot',
        'glyphicons-halflings-regular.svg',
        'glyphicons-halflings-regular.ttf',
        'glyphicons-halflings-regular.woff',
        'glyphicons-halflings-regular.woff2',
        'index.html',
        'manifest.js',
        'manifest.js.map',
        'subdir',
        'subdir/shyamalan.jpg',
        'vendor.css',
        'vendor.css.map',
        'vendor.js',
        'vendor.js.map',
      ])
    })
  })

  describe('react-component-with-css project using --copy-files', () => {
    let originalCwd
    let originalNodeEnv
    let tmpDir

    before(done => {
      originalCwd = process.cwd()
      originalNodeEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      tmpDir = temp.mkdirSync('react-component-with-css')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/react-component-with-css'), tmpDir, {}, err => {
        if (err) return done(err)
        process.chdir(tmpDir)
        execSync('npm install', {stdio: 'inherit'})
        cli(['build', '--copy-files'], err => {
          expect(err).toNotExist()
          done()
        })
      })
    })

    after(done => {
      process.chdir(originalCwd)
      process.env.NODE_ENV = originalNodeEnv
      rimraf(tmpDir, done)
    })

    it('copies non-JS files', () => {
      let files = glob.sync('**/*', {cwd: path.resolve('lib')})
      expect(files).toEqual([
        'components',
        'components/Thing.css',
        'components/Thing.js',
        'index.js',
      ])
    })
  })
})
