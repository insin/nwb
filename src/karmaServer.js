import {Server, config} from 'karma'

import {getPluginConfig, getUserConfig} from './config'
import createKarmaConfig from './createKarmaConfig'
import {KarmaExitCodeError} from './errors'

export default function karmaServer(args, buildConfig, cb) {
  // Force the environment to test
  process.env.NODE_ENV = 'test'

  let pluginConfig = getPluginConfig(args)
  let userConfig = getUserConfig(args, {pluginConfig})
  let karmaConfig = createKarmaConfig(args, buildConfig, pluginConfig, userConfig)

  new Server(config.parseConfig(null, karmaConfig), (exitCode) => {
    if (exitCode !== 0) return cb(new KarmaExitCodeError(exitCode))
    cb()
  }).start()
}
