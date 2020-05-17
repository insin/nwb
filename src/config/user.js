import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import webpack from 'webpack'

import {CONFIG_FILE_NAME, PROJECT_TYPES} from '../constants'
import debug from '../debug'
import {ConfigValidationError} from '../errors'
import {deepToString, joinAnd, pluralise as s, replaceArrayMerge, typeOf} from '../utils'
import {processBabelConfig} from './babel'
import {processKarmaConfig} from './karma'
import {processNpmBuildConfig} from './npm'
import UserConfigReport from './UserConfigReport'
import {processWebpackConfig} from './webpack'

const DEFAULT_REQUIRED = false

/**
 * Load a user config file and process it.
 */
export function getUserConfig(args = {}, options = {}) {
  let {
    check = false,
    pluginConfig = {}, // eslint-disable-line no-unused-vars
    required = DEFAULT_REQUIRED,
  } = options

  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let configPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file is required by the current command, or if the
  // user specified a custom location, and it doesn't exist.
  let configFileExists = fs.existsSync(configPath)
  if ((args.config || required) && !configFileExists) {
    throw new Error(`Couldn't find a config file at ${configPath}`)
  }

  // If a config file exists, it should be a valid module regardless of whether
  // or not it's required.
  if (configFileExists) {
    try {
      userConfig = require(configPath)
      debug('imported config module from %s', configPath)
      // Delete the config file from the require cache as some builds need to
      // import it multiple times with a different NODE_ENV in place.
      delete require.cache[configPath]
    }
    catch (e) {
      throw new Error(`Couldn't import the config file at ${configPath}: ${e.message}\n${e.stack}`)
    }
  }

  userConfig = processUserConfig({
    args,
    check,
    configFileExists,
    configPath,
    pluginConfig,
    required,
    userConfig,
  })

  if (configFileExists) {
    userConfig.path = configPath
  }

  return userConfig
}

/**
 * Load a user config file to get its project type. If we need to check the
 * project type, a config file must exist.
 */
export function getProjectType(args = {}) {
  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let configPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file doesn't exist
  let configFileExists = fs.existsSync(configPath)
  if (!configFileExists) {
    throw new Error(`Couldn't find a config file at ${configPath} to determine project type.`)
  }

  try {
    userConfig = require(configPath)
    // Delete the file from the require cache as it may be imported multiple
    // times with a different NODE_ENV in place depending on the command.
    delete require.cache[configPath]
  }
  catch (e) {
    throw new Error(`Couldn't import the config file at ${configPath}: ${e.message}\n${e.stack}`)
  }

  // Config modules can export a function if they need to access the current
  // command or the webpack dependency nwb manages for them.
  if (typeOf(userConfig) === 'function') {
    userConfig = userConfig({
      args,
      command: args._[0],
      webpack,
    })
  }

  let report = new UserConfigReport({configFileExists, configPath})

  if (!PROJECT_TYPES.has(userConfig.type)) {
    report.error('type', userConfig.type, `Must be one of: ${joinAnd(Array.from(PROJECT_TYPES), 'or')}`)
  }
  if (report.hasErrors()) {
    throw new ConfigValidationError(report)
  }

  return userConfig.type
}

let warnedAboutPolyfillConfig = false

/**
 * Validate user config and perform any supported transformations to it.
 */
export function processUserConfig({
  args = {},
  check = false,
  configFileExists,
  configPath,
  pluginConfig = {},
  required = DEFAULT_REQUIRED,
  userConfig,
}) {
  // Config modules can export a function if they need to access the current
  // command or the webpack dependency nwb manages for them.
  if (typeOf(userConfig) === 'function') {
    userConfig = userConfig({
      args,
      command: args._[0],
      webpack,
    })
  }

  let report = new UserConfigReport({configFileExists, configPath})

  let {
    type, browsers,
    // TODO Deprecated - remove
    polyfill,
    babel, devServer, karma, npm, webpack: _webpack, // eslint-disable-line no-unused-vars
    ...unexpectedConfig
  } = userConfig

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'nwb config',
      unexpectedProps.join(', '),
      `Unexpected top-level prop${s(unexpectedProps.length)} in nwb config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md for supported config'
    )
  }

  if ((required || 'type' in userConfig) && !PROJECT_TYPES.has(type)) {
    report.error('type', userConfig.type, `Must be one of: ${joinAnd(Array.from(PROJECT_TYPES), 'or')}`)
  }

  if ('browsers' in userConfig) {
    if (typeOf(browsers) === 'string' || typeOf(browsers) === 'array') {
      userConfig.browsers = {
        development: browsers,
        production: browsers
      }
    }
    else if (typeOf(browsers) === 'object') {
      if (!browsers.hasOwnProperty('development') && !browsers.hasOwnProperty('production')) {
        report.hint(
          'browsers',
          `You provided ${chalk.cyan('browsers')} config but didn't provide ${chalk.cyan('development')} or ${chalk.cyan('production')} settings`
        )
      }
    }
    else {
      report.error(
        'browsers',
        `type: ${typeOf(browsers)}`,
        `Must be a ${chalk.cyan('String')}, ${chalk.cyan('Array')} or ${chalk.cyan('Object')}`
      )
    }
  }

  // TODO Deprecated - remove
  if ('polyfill' in userConfig) {
    if (!warnedAboutPolyfillConfig) {
      report.deprecated(
        'polyfill',
        'Default polyfills were removed in nwb v0.25.0, so polyfill config is no longer supported'
      )
      warnedAboutPolyfillConfig = true
    }
  }

  let argumentOverrides = {}
  void ['babel', 'devServer', 'karma', 'npm', 'webpack'].forEach(prop => {
    // Set defaults for top-level config objects so we don't have to
    // existence-check them everywhere.
    if (!(prop in userConfig)) {
      userConfig[prop] = {}
    }
    else if (typeOf(userConfig[prop]) !== 'object') {
      report.error(
        prop,
        `type: ${typeOf(userConfig[prop])}`,
        `${chalk.cyan(prop)} config must be an ${chalk.cyan('Object')} `
      )
      // Set a valid default so further checks can continue
      userConfig[prop] = {}
    }
    // Allow config overrides via --path.to.config in args
    if (typeOf(args[prop]) === 'object') {
      argumentOverrides[prop] = args[prop]
    }
  })

  if (Object.keys(argumentOverrides).length > 0) {
    debug('user config arguments: %s', deepToString(argumentOverrides))
    userConfig = replaceArrayMerge(userConfig, argumentOverrides)
    report.hasArgumentOverrides = true
  }

  processBabelConfig({report, userConfig})
  processKarmaConfig({report, userConfig})
  processNpmBuildConfig({report, userConfig})
  processWebpackConfig({pluginConfig, report, userConfig})

  if (report.hasErrors()) {
    throw new ConfigValidationError(report)
  }
  if (check) {
    throw report
  }
  if (report.hasSomethingToReport()) {
    report.log()
  }

  debug('user config: %s', deepToString(userConfig))

  return userConfig
}
