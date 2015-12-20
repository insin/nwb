import path from 'path'

import expect from 'expect'
import rimraf from 'rimraf'
import temp from 'temp'

describe('command: test', function() {
  this.timeout(60000)

  let cli = require('../../src/cli')
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
})
