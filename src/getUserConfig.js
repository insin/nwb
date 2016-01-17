import path from 'path'

import chalk from 'chalk'
import glob from 'glob'

import {PROJECT_TYPES} from './constants'
import debug from './debug'
import {UserError} from './errors'

const DEFAULT_BUILD_CONFIG = {
  externals: {},
  global: '',
  jsNext: false,
  umd: false
}

// TODO Remove in nwb 0.9
const BUILD_CONFIG_PROPS = Object.keys(DEFAULT_BUILD_CONFIG)
let warnedAboutBuildConfig = false

export default function getUserConfig(args = {}) {
  // Try to load default user config, or user a config file path we were given
  let userConfig = {}
  let userConfigPath = args.absConfig || path.resolve(args.config || 'nwb.config.js')

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

  // TODO Remove in nwb 0.9
  if (BUILD_CONFIG_PROPS.some(prop => prop in userConfig)) {
    if (!warnedAboutBuildConfig) {
      console.warn(chalk.magenta([
        'nwb: the top level of your nwb config contains npm module build configuration',
        'nwb: nwb >= 0.9 will require this to be moved into a "build" object'
      ].join('\n')))
      warnedAboutBuildConfig = true
    }
    let buildConfig = {...DEFAULT_BUILD_CONFIG}
    BUILD_CONFIG_PROPS.forEach(prop => {
      if (prop in userConfig) {
        buildConfig[prop] = userConfig[prop]
        delete userConfig[prop]
      }
    })
    userConfig.build = buildConfig
  }

  // Set defaults for npm build config
  if (!('build' in userConfig)) {
    userConfig.build = {...DEFAULT_BUILD_CONFIG}
  }
  else {
    BUILD_CONFIG_PROPS.forEach(prop => {
      if (!(prop in userConfig.build)) {
        userConfig.build[prop] = DEFAULT_BUILD_CONFIG[prop]
      }
    })
  }

  debug('final user config: %o', userConfig)

  return userConfig
}
