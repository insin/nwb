import fs from 'fs'
import path from 'path'

import expect from 'expect'
import glob from 'glob'
import rimraf from 'rimraf'
import temp from 'temp'

let cli = require('../../src/cli')

describe('command: nwb new', function() {
  this.timeout(40000)

  let originalCwd
  let tmpDir

  beforeEach(() => {
    originalCwd = process.cwd()
    tmpDir = temp.mkdirSync('nwb-new-module')
    process.chdir(tmpDir)
  })

  afterEach(done => {
    process.chdir(originalCwd)
    rimraf(tmpDir, done)
  })

  describe('with missing or invalid arguments', function() {
    this.timeout(200)
    it('prints usage info without any arguments', done => {
      cli(['new'], err => {
        expect(err).toExist()
        expect(err.message).toContain('usage: nwb new')
        done()
      })
    })
    it('requires a project type', done => {
      cli(['new', ''], err => {
        expect(err).toExist()
        expect(err.message).toContain('a project type must be provided')
        done()
      })
    })
    it('requires a valid project type', done => {
      cli(['new', 'test-app'], err => {
        expect(err).toExist()
        expect(err.message).toContain('project type must be one of')
        done()
      })
    })
    it('requires a project name', done => {
      cli(['new', 'web-module'], err => {
        expect(err).toExist()
        expect(err.message).toContain('a project name must be provided')
        done()
      })
    })
    it('checks if the project directory already exists', done => {
      fs.mkdirSync('existing-dir')
      cli(['new', 'web-module', 'existing-dir', '-f'], err => {
        expect(err).toExist()
        expect(err.message).toContain('directory already exists')
        done()
      })
    })
  })

  describe('web modules and React components', () => {
    it('creates a new web module with a given name', done => {
      cli(['new', 'web-module', 'test-module', '-f'], err => {
        expect(err).toNotExist('No errors creating new web module')
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
        expect(pkg['jsnext:main']).toBe('es6/index.js')
        let config = require(path.resolve('test-module/nwb.config.js'))
        expect(config).toEqual({
          type: 'web-module',
          umd: false,
          global: '',
          externals: {},
          jsNext: true
        })
        done()
      })
    })

    it('creates a new React component with a given name', done => {
      cli(['new', 'react-component', 'test-component', '-f'], err => {
        expect(err).toNotExist('No errors creating new React component')
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
        expect(pkg['jsnext:main']).toBe('es6/index.js')
        let config = require(path.resolve('test-component/nwb.config.js'))
        expect(config).toEqual({
          type: 'react-component',
          umd: false,
          global: '',
          externals: {react: 'React'},
          jsNext: true
        })
        done()
      })
    })
  })

  describe('web apps', () => {
    it('creates a new React app with a given name', done => {
      cli(['new', 'react-app', 'test-app', '-f'], err => {
        expect(err).toNotExist('No errors creating new React app')
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
        let config = require(path.resolve('test-app/nwb.config.js'))
        expect(config).toEqual({
          type: 'react-app'
        })
        done()
      })
    })

    it('creates a new web app with a given name', done => {
      cli(['new', 'web-app', 'test-app', '-f'], err => {
        expect(err).toNotExist('No errors creating new web app')
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
          'test-app/src/index.js',
          'test-app/tests',
          'test-app/tests/.eslintrc',
          'test-app/tests/index-test.js'
        ])
        let pkg = require(path.resolve('test-app/package.json'))
        expect(pkg.name).toBe('test-app')
        let config = require(path.resolve('test-app/nwb.config.js'))
        expect(config).toEqual({
          type: 'web-app'
        })
        done()
      })
    })
  })
})
