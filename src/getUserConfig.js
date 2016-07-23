import path from 'path'

import {magenta} from 'chalk'
import glob from 'glob'
import webpack from 'webpack'

import {CONFIG_FILE_NAME, PROJECT_TYPES} from './constants'
import debug from './debug'
import {UserError} from './errors'
import {deepToString, typeOf} from './utils'

const DEFAULT_REQUIRED = false

const BABEL_RUNTIME_OPTIONS = ['helpers', 'regenerator', 'polyfill']

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

// TODO Remove in a future version
let warnedAboutBuildChange = false
function upgradeBuildConfig(build, userConfigPath) {
  let npm = {}
  if (build.jsNext) {
    npm.jsNext = !!build.jsNext
  }
  if (build.umd) {
    let hasExternals = !!build.externals && Object.keys(build.externals).length > 0
    if (!hasExternals) {
      npm.umd = build.global
    }
    else {
      npm.umd = {global: build.global, externals: build.externals}
    }
  }
  if (!warnedAboutBuildChange) {
    console.log(magenta([
      'nwb: "build" config is deprecated in favour of "npm" config as of nwb v0.12',
      'nwb: I can automatically upgrade your config to the new format for this build',
      'nwb: This is the equivalent "npm" config for your current "build" config:',
      JSON.stringify({npm}, null, 2),
      `nwb: Please update your configuration file: ${userConfigPath}`,
    ].join('\n')))
    warnedAboutBuildChange = true
  }
  return npm
}

/**
 * Validate user config and perform any necessary validation and transformation
 * to it.
 */
export function processUserConfig({args, required = DEFAULT_REQUIRED, userConfig, userConfigPath}) {
  // Config modules can export a function if they need to access the current
  // command or the webpack dependency nwb manages for them.
  if (typeOf(userConfig) === 'function') {
    userConfig = userConfig({
      command: args._[0],
      webpack,
    })
  }

  function invalidConfig(type, value, message) {
    throw new UserError(
      `nwb: invalid ${type} config in ${userConfigPath}: ${value}`,
      `nwb: ${type} ${message}`
    )
  }

  if ((required || 'type' in userConfig) && PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    invalidConfig('type', userConfig.type, `must be one of: ${PROJECT_TYPES.join(', ')}`)
  }

  // TODO Remove in a future version
  if (userConfig.build) {
    userConfig.npm = upgradeBuildConfig(userConfig.build, userConfigPath)
    delete userConfig.build
  }

  // Set defaults for config objects so we don't have to existence-check them
  // everywhere.
  void ['babel', 'npm', 'webpack'].forEach(prop => {
    if (!(prop in userConfig)) userConfig[prop] = {}
  })

  // Validate babel config
  if (!!userConfig.babel.stage || userConfig.babel.stage === 0) {
    if (typeOf(userConfig.babel.stage) !== 'number') {
      invalidConfig('babel.stage', userConfig.babel.stage, 'must be a number, or falsy to disable use of a stage preset')
    }
    if (userConfig.babel.stage < 0 || userConfig.babel.stage > 3) {
      invalidConfig('babel.stage', userConfig.babel.stage, 'must be between 0 and 3')
    }
  }
  if (userConfig.babel.presets && !Array.isArray(userConfig.babel.presets)) {
    invalidConfig('babel.presets', userConfig.babel.presets, 'must be an array')
  }
  if (userConfig.babel.plugins && !Array.isArray(userConfig.babel.plugins)) {
    invalidConfig('babel.plugins', userConfig.babel.plugins, 'must be an array')
  }
  if ('runtime' in userConfig.babel &&
      typeOf(userConfig.babel.runtime) !== 'boolean' &&
      BABEL_RUNTIME_OPTIONS.indexOf(userConfig.babel.runtime) === -1) {
    invalidConfig('babel.runtime', userConfig.babel.runtime, "must be boolean or one of: 'helpers', 'regenerator', 'polyfill'")
  }

  // Modify npm build config where convenience shorthand is supported
  if (typeOf(userConfig.npm.umd) === 'string') {
    userConfig.npm.umd = {global: userConfig.npm.umd}
  }

  // Modify webpack config where convenience shorthand is supported
  if (typeOf(userConfig.webpack.autoprefixer) === 'string') {
    userConfig.webpack.autoprefixer = {browsers: userConfig.webpack.autoprefixer}
  }
  if (userConfig.webpack.loaders) {
    prepareWebpackLoaderConfig(userConfig.webpack.loaders)
  }
  if (typeOf(userConfig.webpack.postcss) === 'array') {
    userConfig.webpack.postcss = {defaults: userConfig.webpack.postcss}
  }

  // TODO Remove in a future version
  if (userConfig.webpack.plugins) {
    console.log(magenta(`nwb: webpack.plugins is deprecated as of nwb v0.11 - put this config directly under webpack in ${userConfigPath} instead`))
    userConfig.webpack = {...userConfig.webpack, ...userConfig.webpack.plugins}
    delete userConfig.webpack.plugins
  }

  // TODO Remove in a future version
  if ('loose' in userConfig.babel && typeOf(userConfig.babel.loose) !== 'boolean') {
    console.log(magenta('nwb: babel.loose config is boolean as of nwb v0.12 - converting to boolean for the current build'))
    userConfig.babel.loose = !!userConfig.babel.loose
  }

  debug('user config: %s', deepToString(userConfig))

  return userConfig
}

/**
 * Load a user config file and process it.
 */
export default function getUserConfig(args = {}, {required = DEFAULT_REQUIRED} = {}) {
  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let userConfigPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file is required and doesn't exist
  let configFileExists = glob.sync(userConfigPath).length !== 0
  if ((args.config || required) && !configFileExists) {
    throw new UserError(`nwb: couldn't find a config file at ${userConfigPath}`)
  }

  // If a config file exists, it should be a valid module regardless of whether
  // or not it's required.
  if (configFileExists) {
    try {
      userConfig = require(userConfigPath)
      debug('imported config module from %s', userConfigPath)
      // Delete the file from the require cache as some builds need to import
      // it multiple times with a different NODE_ENV in place.
      delete require.cache[userConfigPath]
    }
    catch (e) {
      throw new UserError(`nwb: couldn't import the config file at ${userConfigPath}: ${e}`)
    }
  }

  return processUserConfig({args, required, userConfig, userConfigPath})
}
