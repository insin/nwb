import path from 'path'

import expect from 'expect'
import glob from 'glob'
import rimraf from 'rimraf'
import temp from 'temp'

let newCmd = require('../../src/commands/new')
let originalCwd
let tmpDir

describe('command: nwb new web-module', () => {
  before(() => {
    originalCwd = process.cwd()
    tmpDir = temp.mkdirSync('nwb-new-module')
    process.chdir(tmpDir)
  })

  after(done => {
    process.chdir(originalCwd)
    rimraf(tmpDir, done)
  })

  it('creates a new web module with a given name', function(done) {
    newCmd({_: ['new', 'web-module', 'test-module'], f: true}, () => {
      expect(glob.sync('**', {dot: true})).toEqual([
        'test-module',
        'test-module/.gitignore',
        'test-module/.travis.yml',
        'test-module/nwb.config.js',
        'test-module/package.json',
        'test-module/README.md',
        'test-module/src',
        'test-module/src/index.js',
        'test-module/tests',
        'test-module/tests/.eslintrc',
        'test-module/tests/index-test.js'
      ])
      let pkg = require(path.resolve('test-module/package.json'))
      expect(pkg.name).toBe('test-module')
      done()
    })
  })
})

describe('command: nwb new react-component', () => {
  before(() => {
    originalCwd = process.cwd()
    tmpDir = temp.mkdirSync('nwb-new-component')
    process.chdir(tmpDir)
  })

  after(done => {
    process.chdir(originalCwd)
    rimraf(tmpDir, done)
  })

  it('creates a new react component with a given name', function(done) {
    this.timeout(20000)
    newCmd({_: ['new', 'react-component', 'test-component'], f: true}, () => {
      expect(glob.sync('**', {dot: true, 'ignore': 'test-component/node_modules/**'})).toEqual([
        'test-component',
        'test-component/.gitignore',
        'test-component/.travis.yml',
        'test-component/demo',
        'test-component/demo/src',
        'test-component/demo/src/index.js',
        'test-component/nwb.config.js',
        'test-component/package.json',
        'test-component/README.md',
        'test-component/src',
        'test-component/src/index.js',
        'test-component/tests',
        'test-component/tests/.eslintrc',
        'test-component/tests/index-test.js'
      ])
      expect(glob.sync('test-component/node_modules/*')).toEqual([
        'test-component/node_modules/react',
        'test-component/node_modules/react-dom'
      ])
      let pkg = require(path.resolve('test-component/package.json'))
      expect(pkg.name).toBe('test-component')
      done()
    })
  })
})

describe('command: nwb new react-app', () => {
  before(() => {
    originalCwd = process.cwd()
    tmpDir = temp.mkdirSync('nwb-new-app')
    process.chdir(tmpDir)
  })

  after(done => {
    process.chdir(originalCwd)
    rimraf(tmpDir, done)
  })

  it('creates a new react app with a given name', function(done) {
    this.timeout(20000)
    newCmd({_: ['new', 'react-app', 'test-app'], f: true}, () => {
      expect(glob.sync('**', {dot: true, 'ignore': 'test-app/node_modules/**'})).toEqual([
        'test-app',
        'test-app/.gitignore',
        'test-app/.travis.yml',
        'test-app/nwb.config.js',
        'test-app/package.json',
        'test-app/public',
        'test-app/public/index.html',
        'test-app/README.md',
        'test-app/src',
        'test-app/src/App.js',
        'test-app/src/index.js',
        'test-app/tests',
        'test-app/tests/.eslintrc',
        'test-app/tests/App-test.js'
      ])
      expect(glob.sync('test-app/node_modules/*')).toEqual([
        'test-app/node_modules/react',
        'test-app/node_modules/react-dom'
      ])
      let pkg = require(path.resolve('test-app/package.json'))
      expect(pkg.name).toBe('test-app')
      done()
    })
  })
})
