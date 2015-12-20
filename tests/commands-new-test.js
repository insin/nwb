import expect from 'expect'
import parseArgs from 'minimist'

let {getWebModulePrefs} = require('../src/commands/new')

let moduleArgs = (args, cb) => {
  args.push('-f')
  getWebModulePrefs(parseArgs(args), cb)
}

describe('nwb new', () => {
  describe('command-line arguments', () => {
    it('set umd=false by default', done => {
      moduleArgs([], settings => {
        expect(settings).toEqual({
          globalVariable: '',
          jsNext: true,
          umd: false
        })
        done()
      })
    })
    it('implicitly set umd=true with a --global variable', done => {
      moduleArgs(['--global=Test'], settings => {
        expect(settings).toEqual({
          globalVariable: 'Test',
          jsNext: true,
          umd: true
        })
        done()
      })
    })
    it('implicitly set umd=true with a -g variable', done => {
      moduleArgs(['-g', 'Test'], settings => {
        expect(settings).toEqual({
          globalVariable: 'Test',
          jsNext: true,
          umd: true
        })
        done()
      })
    })
    it('set umd=false with --no-umd', done => {
      moduleArgs(['--no-umd'], settings => {
        expect(settings.umd).toBe(false)
        done()
      })
    })
    it('set umd=false with --umd=false', done => {
      moduleArgs(['--no-umd'], settings => {
        expect(settings.umd).toBe(false)
        done()
      })
    })
    it('set jsNext=false with --no-jsnext', done => {
      moduleArgs(['--no-jsnext'], settings => {
        expect(settings.jsNext).toBe(false)
        done()
      })
    })
  })
})
