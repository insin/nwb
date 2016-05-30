import path from 'path'

import {magenta} from 'chalk'
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
  loaders: {}
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

/**
 * Move loader query config tweaks into a query object, allowing users to
 * provide a flat config.
 */
export function prepareWebpackLoaderConfig(loaders) {
  Object.keys(loaders).forEach(loaderId => {
    let loader = loaders[loaderId]
    if (loader.query) return loader
    let {config, exclude, include, test, ...query} = loader // eslint-disable-line no-unused-vars
    if (Object.keys(query).length > 0) {
      loader.query = query
      Object.keys(query).forEach(prop => delete loader[prop])
    }
  })
}

/**
 * Allow plugin configuration for the app's own CSS only to be provided as an
 * Array instad of an object with a defaults property.
 */
function prepareWebpackPostCSSConfig(postcss) {
  return Array.isArray(postcss) ? {defaults: postcss} : postcss
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

  if (userConfig.webpack.plugins) {
    console.log(magenta('nwb: webpack.plugins in nwb.config.js is deprecated as of nwb 0.11 - put this config directly under webpack instead'))
    userConfig.webpack = {...userConfig.webpack, ...userConfig.webpack.plugins}
    delete userConfig.webpack.plugins
  }

  if (userConfig.webpack.loaders) {
    prepareWebpackLoaderConfig(userConfig.webpack.loaders)
  }

  if (userConfig.webpack.postcss) {
    userConfig.webpack.postcss = prepareWebpackPostCSSConfig(userConfig.webpack.postcss)
  }

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
