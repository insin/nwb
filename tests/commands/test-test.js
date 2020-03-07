import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'

import expect from 'expect'
import rimraf from 'rimraf'
import temp from 'temp'

import cli from '../../src/cli'

describe('command: test', function() {
  this.timeout(90000)

  let originalCwd
  let tmpDir

  beforeEach(() => {
    originalCwd = process.cwd()
    tmpDir = temp.mkdirSync('nwb-test')
    process.chdir(tmpDir)
  })

  afterEach(done => {
    process.chdir(originalCwd)
    rimraf(tmpDir, done)
  })

  it('successfully tests a new web module', function(done) {
    cli(['new', 'web-module', 'test-module', '-f'], err => {
      expect(err).toNotExist('No errors creating new web module')
      process.chdir(path.join(tmpDir, 'test-module'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new web module')
        done()
      })
    })
  })

  it('successfully tests a new React component', function(done) {
    cli(['new', 'react-component', 'test-component', '-f'], err => {
      expect(err).toNotExist('No errors creating new React component')
      process.chdir(path.join(tmpDir, 'test-component'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new React component')
        done()
      })
    })
  })

  it('successfully tests a new React app', function(done) {
    cli(['new', 'react-app', 'test-app'], err => {
      expect(err).toNotExist('No errors creating new React app')
      process.chdir(path.join(tmpDir, 'test-app'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new React app')
        done()
      })
    })
  })

  it('successfully tests a new Preact app', function(done) {
    cli(['new', 'preact-app', 'test-app', '-f'], err => {
      expect(err).toNotExist('No errors creating new Preact app')
      process.chdir(path.join(tmpDir, 'test-app'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new Preact app')
        done()
      })
    })
  })

  it.skip('successfully tests a new Inferno app', function(done) {
    cli(['new', 'inferno-app', 'test-app', '-f'], err => {
      expect(err).toNotExist('No errors creating new Inferno app')
      process.chdir(path.join(tmpDir, 'test-app'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new Inferno app')
        done()
      })
    })
  })

  it('successfully tests a new web app', function(done) {
    cli(['new', 'web-app', 'test-app'], err => {
      expect(err).toNotExist('No errors creating new web app')
      process.chdir(path.join(tmpDir, 'test-app'))
      cli(['test'], err => {
        expect(err).toNotExist('No errors testing new web app')
        done()
      })
    })
  })

  it('calls back with an error if tests fail', function(done) {
    cli(['new', 'web-module', 'test-failure-module', '-f'], err => {
      expect(err).toNotExist('No errors creating new web module for failure test')
      process.chdir(path.join(tmpDir, 'test-failure-module'))
      let content = fs.readFileSync('./tests/index.test.js', 'utf-8')
      fs.writeFileSync('./tests/index.test.js', content.replace('Welcome to', 'X'))
      cli(['test'], err => {
        expect(err).toExist()
        done()
      })
    })
  })

  it('exits with a non-zero code if tests fail', function(done) {
    cli(['new', 'web-module', 'test-failure-module', '-f'], err => {
      expect(err).toNotExist('No errors creating new web module for failure test')
      process.chdir(path.join(tmpDir, 'test-failure-module'))
      let content = fs.readFileSync('./tests/index.test.js', 'utf-8')
      fs.writeFileSync('./tests/index.test.js', content.replace('Welcome to', 'X'))
      try {
        execSync(['node', path.join(__dirname, '../../lib/bin/nwb.js'), 'test'].join(' '), {
          stdio: 'inherit'
        })
        done(new Error('test should have failed'))
      }
      catch (e) {
        expect(e.status).toEqual(1)
        done()
      }
    })
  })
})
