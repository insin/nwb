import {execSync} from 'child_process'
import path from 'path'

import copyTemplateDir from 'copy-template-dir'
import expect from 'expect'
import rimraf from 'rimraf'
import temp from 'temp'

import cli from '../../src/cli'

describe('sample projects', function() {
  this.timeout(60000)
  describe('async-await project', () => {
    let originalCwd
    let originalNodeEnv
    let tmpDir

    before(done => {
      originalCwd = process.cwd()
      originalNodeEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      tmpDir = temp.mkdirSync('async-await')
      copyTemplateDir(path.join(__dirname, '../fixtures/projects/async-await'), tmpDir, {}, err => {
        if (err) return done(err)
        process.chdir(tmpDir)
        execSync('npm install', {stdio: [0, 1, 2]})
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
})
