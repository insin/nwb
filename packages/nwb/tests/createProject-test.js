import expect from 'expect'
import parseArgs from 'minimist'

import {getNpmModulePrefs} from '../src/createProject'

let moduleArgs = (args, cb) => {
  args.push('-f')
  getNpmModulePrefs(parseArgs(args), cb)
}

describe('getNpmModulePrefs()', () => {
  it('defaults settings', done => {
    moduleArgs([], (err, settings) => {
      expect(err).toNotExist()
      expect(settings).toEqual({
        esModules: true,
        umd: false,
      })
      done()
    })
  })
})
