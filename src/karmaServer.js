import argvSetEnv from 'argv-set-env'
import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'
import {KarmaExitCodeError} from './errors'
import getUserConfig from './getUserConfig'

export default function karmaServer(args, cb) {
  argvSetEnv()

  // Force the environment to test
  process.env.NODE_ENV = 'test'

  let isCi = process.env.CI || process.env.CONTINUOUS_INTEGRATION

  let userConfig = getUserConfig(args)
  let karmaConfig = createKarmaConfig({
    codeCoverage: isCi || !!args.coverage,
    singleRun: isCi || !args.server,
  }, userConfig)

  new Server(karmaConfig, (exitCode) => {
    if (exitCode !== 0) return cb(new KarmaExitCodeError(exitCode))
    cb()
  }).start()
}
