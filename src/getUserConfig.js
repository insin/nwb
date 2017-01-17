import path from 'path'
import util from 'util'

import chalk from 'chalk'
import figures from 'figures'
import glob from 'glob'
import webpack from 'webpack'

import {CONFIG_FILE_NAME, PROJECT_TYPES} from './constants'
import {COMPAT_CONFIGS} from './createWebpackConfig'
import debug from './debug'
import {ConfigValidationError, UserError} from './errors'
import {deepToString, typeOf} from './utils'

const DEFAULT_REQUIRED = false

const BABEL_RUNTIME_OPTIONS = ['helpers', 'polyfill']

let s = (n) => n === 1 ? '' : 's'

export class UserConfigReport {
  constructor(configPath) {
    this.configPath = configPath
    this.deprecations = []
    this.errors = []
    this.hints = []
  }

  deprecated(path, ...messages) {
    this.deprecations.push({path, messages})
  }

  error(path, value, message) {
    this.errors.push({path, value, message})
  }

  hasErrors() {
    return this.errors.length > 0
  }

  hasSomethingToReport() {
    return this.errors.length + this.deprecations.length + this.hints.length > 0
  }

  hint(path, ...messages) {
    this.hints.push({path, messages})
  }

  log() {
    console.log(chalk.underline(`nwb config report for ${this.configPath}`))
    console.log()
    if (!this.hasSomethingToReport()) {
      console.log(chalk.green(`${figures.tick} Nothing to report!`))
      return
    }

    if (this.errors.length) {
      let count = this.errors.length > 1 ? `${this.errors.length} ` : ''
      console.log(chalk.red.underline(`${count}Error${s(this.errors.length)}`))
      console.log()
    }
    this.errors.forEach(({path, value, message}) => {
      console.log(`${chalk.red(`${figures.cross} ${path}`)} ${chalk.cyan('=')} ${util.inspect(value)}`)
      console.log(`  ${message}`)
      console.log()
    })
    if (this.deprecations.length) {
      let count = this.deprecations.length > 1 ? `${this.deprecations.length} ` : ''
      console.log(chalk.yellow.underline(`${count}Deprecation Warning${s(this.deprecations.length)}`))
      console.log()
    }
    this.deprecations.forEach(({path, messages}) => {
      console.log(chalk.yellow(`${figures.warning} ${path}`))
      messages.forEach(message => {
        console.log(`  ${message}`)
      })
      console.log()
    })
    if (this.hints.length) {
      let count = this.hints.length > 1 ? `${this.hints.length} ` : ''
      console.log(chalk.cyan.underline(`${count}Hint${s(this.hints.length)}`))
      console.log()
    }
    this.hints.forEach(({path, messages}) => {
      console.log(chalk.cyan(`${figures.info} ${path}`))
      messages.forEach(message => {
        console.log(`  ${message}`)
      })
      console.log()
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

let warnedAboutKarmaTestDirs = false

/**
 * Validate user config and perform any necessary validation and transformation
 * to it.
 */
export function processUserConfig({
    args,
    check = false,
    required = DEFAULT_REQUIRED,
    userConfig,
    userConfigPath,
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

  let report = new UserConfigReport(userConfigPath)

  if ((required || 'type' in userConfig) && PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    report.error('type', userConfig.type, `Must be one of: ${PROJECT_TYPES.join(', ')}`)
  }

  // Set defaults for config objects so we don't have to existence-check them
  // everywhere.
  void ['babel', 'karma', 'npm', 'webpack'].forEach(prop => {
    if (!(prop in userConfig)) userConfig[prop] = {}
  })

  // Babel config
  if (!!userConfig.babel.stage || userConfig.babel.stage === 0) {
    if (typeOf(userConfig.babel.stage) !== 'number') {
      report.error(
        'babel.stage',
        userConfig.babel.stage,
        `Must be a ${chalk.cyan('Number')} between ${chalk.cyan('0')} and ${chalk.cyan('3')}, ` +
        `or ${chalk.cyan('false')} to disable use of a stage preset.`
      )
    }
    else if (userConfig.babel.stage < 0 || userConfig.babel.stage > 3) {
      report.error(
        'babel.stage',
        userConfig.babel.stage,
        `Must be between ${chalk.cyan(0)} and ${chalk.cyan(3)}`
      )
    }
  }
  if (userConfig.babel.presets && !Array.isArray(userConfig.babel.presets)) {
    report.error('babel.presets', userConfig.babel.presets, `Must be an ${chalk.cyan('Array')}`)
  }
  if (userConfig.babel.plugins && !Array.isArray(userConfig.babel.plugins)) {
    report.error('babel.plugins', userConfig.babel.plugins, `Must be an ${chalk.cyan('Array')}`)
  }
  if ('runtime' in userConfig.babel &&
      typeOf(userConfig.babel.runtime) !== 'boolean' &&
      BABEL_RUNTIME_OPTIONS.indexOf(userConfig.babel.runtime) === -1) {
    report.error(
      'babel.runtime',
      userConfig.babel.runtime,
      `Must be ${chalk.cyan('boolean')}, ${chalk.cyan("'helpers'")} or ${chalk.cyan("'polyfill'")})`
    )
  }

  if ('loose' in userConfig.babel) {
    if (typeOf(userConfig.babel.loose) !== 'boolean') {
      report.error(
        'babel.loose',
        userConfig.babel.loose,
        `Must be ${chalk.cyan('boolean')}`
      )
    }
    else if (userConfig.babel.loose === true) {
      report.hint('babel.loose',
        'Loose mode is enabled by default, so you can remove this config.'
      )
    }
  }

  // Karma config
  // TODO Remove in a future version
  if (userConfig.karma.testDir || userConfig.karma.testDirs) {
    // We secretly supported passing testDir too
    let prop = userConfig.karma.testDir ? 'testDir' : 'testDirs'
    if (!warnedAboutKarmaTestDirs) {
      report.deprecated(
        `karma.${prop}`,
        `Deprecated as of nwb v0.15 - this has been renamed to ${chalk.cyan('karma.excludeFromCoverage')}.`
      )
      warnedAboutKarmaTestDirs = true
    }
    userConfig.karma.excludeFromCoverage = userConfig.karma[prop]
    delete userConfig.karma[prop]
  }

  // npm build config
  if (typeOf(userConfig.npm.umd) === 'string') {
    userConfig.npm.umd = {global: userConfig.npm.umd}
  }

  // Webpack config
  if (typeOf(userConfig.webpack.autoprefixer) === 'string') {
    userConfig.webpack.autoprefixer = {browsers: userConfig.webpack.autoprefixer}
  }

  if ('copy' in userConfig.webpack) {
    if (typeOf(userConfig.webpack.copy) === 'array') {
      userConfig.webpack.copy = {patterns: userConfig.webpack.copy}
    }
    else if (typeOf(userConfig.webpack.copy) === 'object') {
      if (!userConfig.webpack.copy.patterns &&
          !userConfig.webpack.copy.options) {
        report.error(
          'webpack.copy',
          userConfig.webpack.copy,
          `Must include ${chalk.cyan('patterns')} or ${chalk.cyan('options')} when given as an ${chalk.cyan('Object')}`
        )
      }
      if (userConfig.webpack.copy.patterns &&
          typeOf(userConfig.webpack.copy.patterns) !== 'array') {
        report.error(
          'webpack.copy.patterns',
          userConfig.webpack.copy.patterns,
          `Must be an ${chalk.cyan('Array')} when provided`
        )
      }
      if (userConfig.webpack.copy.options &&
          typeOf(userConfig.webpack.copy.options) !== 'object') {
        report.error(
          'webpack.copy.options',
          userConfig.webpack.copy.options,
          `Must be an ${chalk.cyan('Object')} when provided.`
        )
      }
    }
    else {
      report.error(
        'webpack.copy',
        userConfig.webpack.copy,
        `Must be an ${chalk.cyan('Array')} or an ${chalk.cyan('Object')}.`
      )
    }
  }

  if (userConfig.webpack.compat) {
    let compatProps = Object.keys(userConfig.webpack.compat)
    let unknownCompatProps = compatProps.filter(prop => !(prop in COMPAT_CONFIGS))
    if (unknownCompatProps.length !== 0) {
      report.error(
        'userConfig.webpack.compat',
        compatProps,
        `Unknown propert${unknownCompatProps.length === 1 ? 'y' : 'ies'} present.` +
        `Valid properties are: ${Object.keys(COMPAT_CONFIGS).join(', ')}.`)
    }

    if (userConfig.webpack.compat.moment &&
        typeOf(userConfig.webpack.compat.moment.locales) !== 'array') {
      report.error(
        'webpack.compat.moment.locales',
        webpack.compat.moment.locales,
        'Must be an Array.'
      )
    }
  }

  if (userConfig.webpack.vendorBundle === false) {
    report.error(
      'webpack.vendorBundle',
      webpack.vendorBundle,
      'No longer supported - add a --no-vendor flag to your build command instead.'
    )
  }

  if (userConfig.webpack.loaders) {
    prepareWebpackLoaderConfig(userConfig.webpack.loaders)
  }

  if (typeOf(userConfig.webpack.postcss) === 'array') {
    userConfig.webpack.postcss = {defaults: userConfig.webpack.postcss}
  }

  if (userConfig.webpack.extra) {
    if (userConfig.webpack.extra.output &&
        userConfig.webpack.extra.output.publicPath) {
      report.hint('webpack.extra.output.publicPath',
        `You can use the more convenient ${chalk.green('webpack.publicPath')} instead.`
      )
    }
    if (userConfig.webpack.extra.resolve &&
        userConfig.webpack.extra.resolve.alias) {
      report.hint('webpack.extra.resolve.alias',
        `You can use the more convenient ${chalk.green('webpack.aliases')} instead.`
      )
    }
  }

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

/**
 * Load a user config file and process it.
 */
export default function getUserConfig(args = {}, options = {}) {
  let {
    check = false,
    required = DEFAULT_REQUIRED,
  } = options
  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let userConfigPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file is required and doesn't exist
  let configFileExists = glob.sync(userConfigPath).length !== 0
  if ((args.config || required) && !configFileExists) {
    throw new UserError(`Couldn't find a config file at ${userConfigPath}`)
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
      throw new UserError(`Couldn't import the config file at ${userConfigPath}: ${e.message}\n${e.stack}`)
    }
  }

  return processUserConfig({args, check, required, userConfig, userConfigPath})
}
