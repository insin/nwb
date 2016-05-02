import expect from 'expect'
import parseArgs from 'minimist'

let {getWebModulePrefs} = require('../src/createProject')

let moduleArgs = (args, cb) => {
  args.push('-f')
  getWebModulePrefs(parseArgs(args), cb)
}

describe('getWebModulePrefs()', () => {
  it('set umd=false by default', done => {
    moduleArgs([], (err, settings) => {
      expect(err).toNotExist()
      expect(settings).toEqual({
        globalVariable: '',
        jsNext: true,
        umd: false
      })
      done()
    })
  })
  it('implicitly set umd=true with a --global variable', done => {
    moduleArgs(['--global=Test'], (err, settings) => {
      expect(err).toNotExist()
      expect(settings).toEqual({
        globalVariable: 'Test',
        jsNext: true,
        umd: true
      })
      done()
    })
  })
  it('implicitly set umd=true with a -g variable', done => {
    moduleArgs(['-g', 'Test'], (err, settings) => {
      expect(err).toNotExist()
      expect(settings).toEqual({
        globalVariable: 'Test',
        jsNext: true,
        umd: true
      })
      done()
    })
  })
  it('set umd=false with --no-umd', done => {
    moduleArgs(['--no-umd'], (err, settings) => {
      expect(err).toNotExist()
      expect(settings.umd).toBe(false)
      done()
    })
  })
  it('set umd=false with --umd=false', done => {
    moduleArgs(['--no-umd'], (err, settings) => {
      expect(err).toNotExist()
      expect(settings.umd).toBe(false)
      done()
    })
  })
  it('set jsNext=false with --no-jsnext', done => {
    moduleArgs(['--no-jsnext'], (err, settings) => {
      expect(err).toNotExist()
      expect(settings.jsNext).toBe(false)
      done()
    })
  })
})
