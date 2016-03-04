import fs from 'fs'
import path from 'path'

import expect from 'expect'
import glob from 'glob'
import rimraf from 'rimraf'
import temp from 'temp'

import cli from '../../src/cli'

describe('command: build', function() {
  this.timeout(60000)

  let originalCwd
  let originalNodeEnv
  let tmpDir

  function setUp() {
    originalCwd = process.cwd()
    originalNodeEnv = process.env.NODE_ENV
    delete process.env.NODE_ENV
    tmpDir = temp.mkdirSync('nwb-test')
    process.chdir(tmpDir)
    return {originalCwd, originalNodeEnv, tmpDir}
  }

  function tearDown(done) {
    process.chdir(originalCwd)
    process.env.NODE_ENV = originalNodeEnv
    rimraf(tmpDir, done)
  }

  describe('building a React app', () => {
    let builtAppSource

    before(done => {
      setUp()
      cli(['new', 'react-app', 'test-app'], err => {
        expect(err).toNotExist('No errors creating a new React app')
        process.chdir(path.join(tmpDir, 'test-app'))
        cli(['build'], err => {
          expect(err).toNotExist('No errors building a React app')
          builtAppSource = fs.readFileSync('dist/app.js', 'utf8')
          done()
        })
      })
    })
    after(tearDown)

    it('creates a build with sourcemaps', () => {
      expect(glob.sync('*', {cwd: path.resolve('dist')})).toEqual([
        'app.js',
        'app.js.map',
        'index.html',
        'vendor.js',
        'vendor.js.map'
      ])
    })
    it('generates displayName for React.createClass calls in the build', () => {
      expect(builtAppSource).toInclude('displayName:"App"')
    })
    it('creates a production-optimised build with inline elements by default', () => {
      expect(builtAppSource).toExclude('.createElement(')
    })
  })

  describe('building a React component and its demo app', () => {
    before(done => {
      setUp()
      cli(['new', 'react-component', 'test-component', '--global=TestComponent', '-f'], err => {
        expect(err).toNotExist('No errors creating a new React component')
        process.chdir(path.join(tmpDir, 'test-component'))
        cli(['build'], err => {
          expect(err).toNotExist('No errors building a React component')
          done()
        })
      })
    })
    after(tearDown)

    it('creates an ES5 build', () => {
      expect(glob.sync('*', {cwd: path.resolve('lib')})).toEqual([
        'index.js'
      ])
    })
    it('creates an ES6 build', () => {
      expect(glob.sync('*', {cwd: path.resolve('es6')})).toEqual([
        'index.js'
      ])
    })
    it('creates a UMD build with a sourcemap', () => {
      expect(glob.sync('*', {cwd: path.resolve('umd')})).toEqual([
        'test-component.js',
        'test-component.min.js',
        'test-component.min.js.map'
      ])
    })
    it('exports the configured global in the UMD build', () => {
      expect(fs.readFileSync('umd/test-component.js', 'utf8'))
        .toInclude('root["TestComponent"]')
    })
    it('builds the demo app with a sourcemap', () => {
      expect(glob.sync('*', {cwd: path.resolve('demo/dist')})).toEqual([
        'demo.js',
        'demo.js.map',
        'index.html'
      ])
    })
    it('generates displayName for React.createClass calls in the demo build', () => {
      expect(fs.readFileSync('demo/dist/demo.js', 'utf8'))
        .toInclude('displayName:"Demo"')
    })
  })
})
