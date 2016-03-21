import path from 'path'

import glob from 'glob'
import webpack from 'webpack'

import {PROJECT_TYPES} from './constants'
import debug from './debug'
import {UserError} from './errors'

const DEFAULT_BUILD_CONFIG = {
  externals: {},
  global: '',
  jsNext: false,
  umd: false
}

const DEFAULT_WEBPACK_CONFIG = {
  loaders: {},
  plugins: {}
}

function applyDefaultConfig(userConfig, topLevelProp, defaults) {
  if (!(topLevelProp in userConfig)) {
    userConfig[topLevelProp] = {...defaults}
  }
  else {
    Object.keys(defaults).forEach(prop => {
      if (!(prop in userConfig[topLevelProp])) {
        userConfig[topLevelProp][prop] = defaults[prop]
      }
    })
  }
}

export default function getUserConfig(args = {}, {required = false} = {}) {
  // Try to load default user config, or use a config file path we were given
  // (undocumented).
  let userConfig = {}
  let userConfigPath = args.absConfig || path.resolve(args.config || 'nwb.config.js')

  // Bail early if a config file is required and doesn't exist
  let configFileExists = glob.sync(userConfigPath).length !== 0
  if (required && !configFileExists) {
    throw new UserError(`nwb: couldn't find a config file at ${userConfigPath}`)
  }

  // If a config file exists, it should be a valid module regardless of whether
  // or not it's required.
  if (configFileExists) {
    try {
      userConfig = require(userConfigPath)
      debug('imported config module from %s', userConfigPath)
    }
    catch (e) {
      throw new UserError(`nwb: couldn't import the config file at ${userConfigPath}: ${e}`)
    }
  }

  if (typeof userConfig == 'function') {
    userConfig = userConfig({
      command: args._[0],
      webpack
    })
  }

  if ((required || 'type' in userConfig) && PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    throw new UserError(
      `nwb: invalid project type configured in ${userConfigPath}: ${userConfig.type}`,
      `nwb: 'type' config must be one of: ${PROJECT_TYPES.join(', ')}`
    )
  }

  // Set defaults for config objects
  applyDefaultConfig(userConfig, 'build', DEFAULT_BUILD_CONFIG)
  applyDefaultConfig(userConfig, 'webpack', DEFAULT_WEBPACK_CONFIG)

  // If the user provided Babel config, automatically apply it to babel-loader
  // as query config unless there's already some set.
  if (userConfig.babel) {
    if (!userConfig.webpack.loaders.babel) {
      userConfig.webpack.loaders.babel = {query: userConfig.babel}
      debug('added babel-loader with user babel config')
    }
    else if (!userConfig.webpack.loaders.babel.query) {
      userConfig.webpack.loaders.babel.query = userConfig.babel
      debug('added query to babel-loader with user babel config')
    }
  }

  debug('final user config: %o', userConfig)

  return userConfig
}
