import path from 'path'

import {MODULE_TYPES} from './constants'
import debug from './debug'

export default function getUserConfig(args) {
  // Try to load default user config, or user a config file path we were given
  let userConfig = {}
  let userConfigPath = path.join(process.cwd(), args.config || 'nwb.config.js')
  try {
    userConfig = require(userConfigPath)
    debug('found nwb config file at %s', userConfigPath)
  }
  catch (e) {
    console.error(`nwb: couldn't find nwb config file at ${userConfigPath}`)
    process.exit(1)
  }

  if (typeof userConfig == 'function') {
    userConfig = userConfig()
  }

  if (MODULE_TYPES.indexOf(userConfig.type) === -1) {
    console.error(`nwb: invalid module type configured in ${userConfigPath}: ${userConfig.type}`)
    console.error(`nwb: 'type' config must be one of: ${MODULE_TYPES.join(', ')}`)
    process.exit(1)
  }

  debug('user config loaded: %o', userConfig)

  return userConfig
}
