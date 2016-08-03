import expect from 'expect'
import parseArgs from 'minimist'

let {getWebModulePrefs} = require('../src/createProject')

let moduleArgs = (args, cb) => {
  args.push('-f')
  getWebModulePrefs(parseArgs(args), cb)
}

describe('getWebModulePrefs()', () => {
  it('defaults settings', done => {
    moduleArgs([], (err, settings) => {
      expect(err).toNotExist()
      expect(settings).toEqual({
        nativeModules: true,
        umd: false,
      })
      done()
    })
  })
})
