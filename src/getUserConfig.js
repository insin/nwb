import fs from 'fs'
import path from 'path'

import {magenta as dep} from 'chalk'
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

let warnedAboutBabelLoose = false
let warnedAboutBuildChange = false
let warnedAboutKarmaTests = false
let warnedAboutWebpackPlugins = false

// TODO Remove in a future version
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
    console.log(dep('nwb: "build" config is deprecated in favour of "npm" config as of nwb v0.12'))
    console.log(dep('nwb: I can automatically upgrade your config to the new format for this build'))
    console.log(dep('nwb: This is the equivalent "npm" config for your current "build" config:'))
    console.log(dep(JSON.stringify({npm}, null, 2)))
    console.log(dep(`nwb: Please update your configuration file: ${userConfigPath}`))
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
  void ['babel', 'karma', 'npm', 'webpack'].forEach(prop => {
    if (!(prop in userConfig)) userConfig[prop] = {}
  })

  // Babel config
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
  // TODO Remove in a future version
  if ('loose' in userConfig.babel && typeOf(userConfig.babel.loose) !== 'boolean') {
    if (!warnedAboutBabelLoose) {
      console.log(dep('nwb: babel.loose config is boolean as of nwb v0.12 - converting to boolean for the current build'))
      warnedAboutBabelLoose = true
    }
    userConfig.babel.loose = !!userConfig.babel.loose
  }

  // Karma config
  // TODO Removed in a future version
  if (userConfig.karma.tests) {
    let log = !warnedAboutKarmaTests
    if (log) console.log(dep(`nwb: karma.tests is deprecated as of nwb v0.12`))
    if (userConfig.karma.tests.indeOf('*') === -1) {
      if (log) console.log(dep(`nwb: karma.tests appears to be a glob, using it as karma.testFiles for this build`))
      userConfig.karma.testFiles = userConfig.karma.tests
    }
    else if (glob.sync(userConfig.karma.tests, {nodir: true}).length === 1 &&
             fs.readFileSync(userConfig.karma.tests, 'utf8').indexOf('require.context') !== -1) {
      if (log) console.log(dep(`nwb: karma.tests appears to be a Webpack context module, using it as karma.testContext for this build`))
      userConfig.karma.testContext = userConfig.karma.tests
    }
    else if (log) {
      console.log(dep(`nwb: if karma.tests points at a Webpack context module, use karma.testContext instead`))
      console.log(dep(`nwb: if karma.tests is a file glob, use karma.testFiles instead`))
      console.log(dep(`nwb: falling back to default config for this build`))
    }
    if (log) {
      warnedAboutKarmaTests = true
    }
    delete userConfig.karma.tests
  }

  // npm build config
  if (typeOf(userConfig.npm.umd) === 'string') {
    userConfig.npm.umd = {global: userConfig.npm.umd}
  }

  // Webpack config
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
    if (!warnedAboutWebpackPlugins) {
      console.log(dep(`nwb: webpack.plugins is deprecated as of nwb v0.11 - put this config directly under webpack in ${userConfigPath} instead`))
      warnedAboutWebpackPlugins = true
    }
    userConfig.webpack = {...userConfig.webpack, ...userConfig.webpack.plugins}
    delete userConfig.webpack.plugins
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
