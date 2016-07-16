import argvSetEnv from 'argv-set-env'
import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'
import getUserConfig from './getUserConfig'

export default function karmaServer(args, cb) {
  argvSetEnv()

  // Force the environment to test
  process.env.NODE_ENV = 'test'

  let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'

  let userConfig = getUserConfig(args)
  let karmaConfig = createKarmaConfig({
    codeCoverage: isCi || !!args.coverage,
    singleRun: isCi || !args.server,
  }, userConfig)

  new Server(karmaConfig, cb).start()
}
