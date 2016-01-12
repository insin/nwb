import path from 'path'

import glob from 'glob'

import {PROJECT_TYPES} from './constants'
import debug from './debug'
import {UserError} from './errors'

export default function getUserConfig(args = {}) {
  // Try to load default user config, or user a config file path we were given
  let userConfig = {}
  let userConfigPath = args.absConfig || path.join(process.cwd(), args.config || 'nwb.config.js')

  if (glob.sync(userConfigPath).length === 0) {
    throw new UserError(`nwb: couldn't find a config file at ${userConfigPath}`)
  }

  try {
    userConfig = require(userConfigPath)
    debug('imported config module from %s', userConfigPath)
  }
  catch (e) {
    // If no user config was found, use default
    userConfig = {
      // Use type web-app since the only differance is when the build gets run
      // in production. Therefor adding a config is only requied when building
      // the project for production.
      type: 'web-app'
    }
  }

  if (typeof userConfig == 'function') {
    userConfig = userConfig()
  }

  if (PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    throw new UserError(
      `nwb: invalid project type configured in ${userConfigPath}: ${userConfig.type}`,
      `nwb: 'type' config must be one of: ${PROJECT_TYPES.join(', ')}`
    )
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
