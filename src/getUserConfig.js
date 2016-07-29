import fs from 'fs'
import path from 'path'
import util from 'util'

import chalk from 'chalk'
import glob from 'glob'
import symbols from 'log-symbols'
import webpack from 'webpack'

import {CONFIG_FILE_NAME, PROJECT_TYPES} from './constants'
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

  hint(path, ...messages) {
    this.hints.push({path, messages})
  }

  log() {
    console.log(chalk.underline(`nwb config report for ${this.configPath}`))
    console.log()
    if (this.errors.length + this.deprecations.length + this.hints.length === 0) {
      console.log(`${symbols.success} ${chalk.green('Nothing to report!')}`)
      return
    }

    if (this.errors.length) {
      console.log(chalk.red.underline(`${this.errors.length} Error${s(this.errors.length)}`))
      console.log()
    }
    this.errors.forEach(({path, value, message}) => {
      console.log(`${symbols.error} ${chalk.red(path)} ${chalk.cyan('=')} ${util.inspect(value)}`)
      console.log(`  ${message}`)
      console.log()
    })
    if (this.deprecations.length) {
      console.log(chalk.yellow.underline(`${this.deprecations.length} Deprecation Warning${s(this.deprecations.length)}`))
      console.log()
    }
    this.deprecations.forEach(({path, messages}) => {
      console.log(`${symbols.warning} ${chalk.yellow(path)}`)
      messages.forEach(message => {
        console.log(`  ${message}`)
      })
      console.log()
    })
    if (this.hints.length) {
      console.log(chalk.blue.underline(`${this.hints.length} Hint${s(this.hints.length)}`))
      console.log()
    }
    this.hints.forEach(({path, messages}) => {
      console.log(`${symbols.info} ${chalk.blue(path)}`)
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

let warnedAboutBabelLoose = false
let warnedAboutBuildChange = false
let warnedAboutKarmaTests = false
let warnedAboutWebpackPlugins = false

// TODO Remove in a future version
function upgradeBuildConfig(build, userConfigPath, report = {deprecated() {}}) {
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
    let messages = [
      `deprecated in favour of ${chalk.green('npm')} config as of nwb v0.12`,
      `nwb will upgrade ${chalk.yellow('build')} config to ${chalk.green('npm')} format during a build`,
      `equivalent ${chalk.green('npm')} config:\n`,
    ].concat(
      JSON.stringify({npm}, null, 2)
        .split('\n')
        .map(line => `  ${chalk.cyan(line)}`)
    )
    report.deprecated('build', ...messages)
    warnedAboutBuildChange = true
  }
  return npm
}

/**
 * Validate user config and perform any necessary validation and transformation
 * to it.
 */
export function processUserConfig({
    args,
    checking = false,
    required = DEFAULT_REQUIRED,
    userConfig,
    userConfigPath,
  }) {
  // Config modules can export a function if they need to access the current
  // command or the webpack dependency nwb manages for them.
  if (typeOf(userConfig) === 'function') {
    userConfig = userConfig({
      command: args._[0],
      webpack,
    })
  }

  let report = new UserConfigReport(userConfigPath)

  if ((required || 'type' in userConfig) && PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    report.error('type', userConfig.type, `must be one of: ${PROJECT_TYPES.join(', ')}`)
  }

  // TODO Remove in a future version
  if (userConfig.build) {
    userConfig.npm = upgradeBuildConfig(userConfig.build, userConfigPath, report)
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
      report.error('babel.stage', userConfig.babel.stage, 'must be a number, or falsy to disable use of a stage preset')
    }
    else if (userConfig.babel.stage < 0 || userConfig.babel.stage > 3) {
      report.error('babel.stage', userConfig.babel.stage, 'must be between 0 and 3')
    }
  }
  if (userConfig.babel.presets && !Array.isArray(userConfig.babel.presets)) {
    report.error('babel.presets', userConfig.babel.presets, 'must be an array')
  }
  if (userConfig.babel.plugins && !Array.isArray(userConfig.babel.plugins)) {
    report.error('babel.plugins', userConfig.babel.plugins, 'must be an array')
  }
  if ('runtime' in userConfig.babel &&
      typeOf(userConfig.babel.runtime) !== 'boolean' &&
      BABEL_RUNTIME_OPTIONS.indexOf(userConfig.babel.runtime) === -1) {
    // TODO Remove in a future version
    if (typeOf(userConfig.babel.runtime) === 'array' &&
        userConfig.babel.runtime[0] === 'runtime') {
      userConfig.babel.runtime = true
      report.deprecated('babel.runtime',
        `must be ${chalk.cyan('boolean')} ${chalk.cyan("'helpers'")}" or ${chalk.cyan("'polyfill'")}" as of nwb v0.12`,
        `nwb will convert deprecated ${chalk.yellow("['runtime']")} config to ${chalk.cyan('true')} during a build`,
      )
    }
    else {
      report.error('babel.runtime', userConfig.babel.runtime, "must be boolean, 'helpers' or 'polyfill'")
    }
  }
  // TODO Remove in a future version - don't convert, just validate
  if ('loose' in userConfig.babel && typeOf(userConfig.babel.loose) !== 'boolean') {
    if (!warnedAboutBabelLoose) {
      let messages = [
        `must be ${chalk.cyan('boolean')} as of nwb v0.12`,
        `nwb will convert deprecated non-boolean config to its boolean equivalent during a build`,
      ]
      if (userConfig.babel.loose) {
        messages.push('loose mode is now on by default, so you can remove this config')
      }
      report.deprecated('babel.loose', ...messages)
      warnedAboutBabelLoose = true
    }
    userConfig.babel.loose = !!userConfig.babel.loose
  }
  else if (userConfig.babel.loose === true) {
    report.hint('babel.loose',
      'loose mode is on by default as of nwb v0.12, so you can remove this config'
    )
  }

  // Karma config
  // TODO Remove in a future version
  if (userConfig.karma.tests) {
    let messages = ['deprecated as of nwb v0.12']
    if (userConfig.karma.tests.indexOf('*') !== -1) {
      messages.push(
        `${chalk.yellow('karma.tests')} appears to be a ${chalk.cyan('file glob')} so you should rename it to ${chalk.green('karma.testFiles')}`,
        `nwb will use it as ${chalk.green('karma.testFiles')} config during a build`,
      )
      userConfig.karma.testFiles = userConfig.karma.tests
    }
    else if (glob.sync(userConfig.karma.tests, {nodir: true}).length === 1 &&
             fs.readFileSync(userConfig.karma.tests, 'utf8').indexOf('require.context') !== -1) {
      messages.push(
        `${chalk.yellow('karma.tests')} appears to be a ${chalk.cyan('Webpack context module')} , so you should rename it to ${chalk.green('karma.testContext')}`,
        `nwb will use it as ${chalk.green('karma.testContext')} config during a build`,
      )
      userConfig.karma.testContext = userConfig.karma.tests
    }
    else {
      messages.push(
        `if ${chalk.yellow('karma.tests')} points at a ${chalk.cyan('Webpack context module')}, use ${chalk.green('karma.testContext')} instead`,
        `if ${chalk.yellow('karma.tests')} is a ${chalk.cyan('file glob')}, use ${chalk.green('karma.testFiles')} instead`,
        `nwb can't tell, so will fall back to its new default config during a build`,
      )
    }
    if (!warnedAboutKarmaTests) {
      report.deprecated('karma.tests', ...messages)
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
          'must include patterns or options when given as an Object'
        )
      }
      if (userConfig.webpack.copy.patterns &&
          typeOf(userConfig.webpack.copy.patterns) !== 'array') {
        report.error(
          'webpack.copy.patterns',
          userConfig.webpack.copy.patterns,
          'must be an Array when provided'
        )
      }
      if (userConfig.webpack.copy.options &&
          typeOf(userConfig.webpack.copy.options) !== 'object') {
        report.error(
          'webpack.copy.options',
          userConfig.webpack.copy.options,
          'must be an Object when provided'
        )
      }
    }
    else {
      report.error(
        'webpack.copy',
        userConfig.webpack.copy,
        'must be an Array or an Object'
      )
    }
  }

  if (userConfig.webpack.loaders) {
    prepareWebpackLoaderConfig(userConfig.webpack.loaders)
  }
  if (typeOf(userConfig.webpack.postcss) === 'array') {
    userConfig.webpack.postcss = {defaults: userConfig.webpack.postcss}
  }
  if (userConfig.webpack.extra &&
      userConfig.webpack.extra.resolve &&
      userConfig.webpack.extra.resolve.alias) {
    report.hint('webpack.extra.resolve.alias',
      `you can use the more convenient ${chalk.green('webpack.alises')} instead`
    )
  }

  // TODO Remove in a future version
  if (userConfig.webpack.plugins) {
    if (!warnedAboutWebpackPlugins) {
      report.deprecated('webpack.plugins',
        'deprecated as of nwb v0.11',
        `put this config directly under ${chalk.cyan('webpack')} instead`,
        `nwb will use this config as if it was under ${chalk.cyan('webpack')} during a build`
      )
      warnedAboutWebpackPlugins = true
    }
    userConfig.webpack = {...userConfig.webpack, ...userConfig.webpack.plugins}
    delete userConfig.webpack.plugins
  }

  if (report.hasErrors()) {
    throw new ConfigValidationError(report)
  }
  if (checking) {
    throw report
  }

  debug('user config: %s', deepToString(userConfig))

  return userConfig
}

/**
 * Load a user config file and process it.
 */
export default function getUserConfig(args = {}, options = {}) {
  let {
    checking = false,
    required = DEFAULT_REQUIRED,
  } = options
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

  return processUserConfig({args, checking, required, userConfig, userConfigPath})
}
