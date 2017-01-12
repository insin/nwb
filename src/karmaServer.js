import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'
import {KarmaExitCodeError} from './errors'
import getUserConfig from './getUserConfig'

export default function karmaServer(args, buildConfig, cb) {
  // Force the environment to test
  process.env.NODE_ENV = 'test'

  let userConfig = getUserConfig(args)
  let karmaConfig = createKarmaConfig(args, buildConfig, userConfig)

  new Server(karmaConfig, (exitCode) => {
    if (exitCode !== 0) return cb(new KarmaExitCodeError(exitCode))
    cb()
  }).start()
}
