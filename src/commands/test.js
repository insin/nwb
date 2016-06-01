import argvSetEnv from 'argv-set-env'

import karmaServer from '../karmaServer'

export default function(args, cb) {
  argvSetEnv()

  // Force the environment to test
  process.env.NODE_ENV = 'test'

  let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'

  console.log('nwb: test')
  karmaServer(args, {
    codeCoverage: isCi || !!args.coverage,
    singleRun: isCi || !args.server
  }, cb)
}
