import path from 'path'

import debug from './debug'

export default function getUserConfig(userConfigFile) {
  // Try to load default user config, or user config file we were given
  var userConfig = {}
  try {
    var userConfigPath = path.join(process.cwd(), userConfigFile || `nwb.config.js`)
    userConfig = require(userConfigPath)
    debug(`Found user nwb config at ${userConfigPath}`)
  }
  catch (e) {
    if (userConfigFile) {
      console.error(`specified nwb config file not found: ${userConfigFile}`)
      process.exit(1)
    }
  }
  if (typeof userConfig == 'function') {
    userConfig = userConfig()
  }
  debug('User config is ', userConfig)
  return userConfig
}
