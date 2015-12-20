import path from 'path'

import glob from 'glob'

import {PROJECT_TYPES, REACT_COMPONENT, WEB_MODULE} from './constants'
import debug from './debug'
import {UserError} from './errors'

// TODO Remove in 0.7
let warnedJSNext = false

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
    throw new UserError(`nwb: couldn't import the config file at ${userConfigPath}`)
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

  // TODO Remove in 0.7
  if ((userConfig.type === REACT_COMPONENT || userConfig.type === WEB_MODULE) &&
      !('jsNext' in userConfig)) {
    if (!warnedJSNext) {
      console.warn([
        'nwb: there was no jsNext setting in your nwb config file - this will default to true in nwb 0.6',
        `nwb: set jsNext: true in ${path.basename(userConfigPath)} if you want to keep using the ES6 modules build`
      ].join('\n'))
      warnedJSNext = true
    }
    userConfig.jsNext = true
  }

  debug('final user config: %o', userConfig)

  return userConfig
}
