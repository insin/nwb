import path from 'path'

import glob from 'glob'

import {MODULE_TYPES} from './constants'
import debug from './debug'

export default function getUserConfig(args = {}) {
  // Try to load default user config, or user a config file path we were given
  let userConfig = {}
  let userConfigPath = args.absConfig || path.join(process.cwd(), args.config || 'nwb.config.js')

  if (glob.sync(userConfigPath).length === 0) {
    console.error(`nwb: couldn't find a config file at ${userConfigPath}`)
    process.exit(1)
  }

  try {
    userConfig = require(userConfigPath)
    debug('imported config module from %s', userConfigPath)
  }
  catch (e) {
    console.error(`nwb: couldn't import the config file at ${userConfigPath}`)
    console.error(e.stack)
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

  // If the user provided some Babel config, automatically apply it to
  // babel-loader as query config unless there's already some set.
  if (!userConfig.loaders) {
    userConfig.loaders = {}
  }
  if (userConfig.babel) {
    if (!userConfig.loaders.babel) {
      userConfig.loaders.babel = {query: userConfig.babel}
      debug('added babel-loader with user babel config')
    }
    else if (!userConfig.loaders.babel.query) {
      userConfig.loaders.babel.query = userConfig.babel
      debug('added query to babel-loader with user babel config')
    }
  }

  debug('final user config: %o', userConfig)

  return userConfig
}
