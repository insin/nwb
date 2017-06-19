import fs from 'fs'
import path from 'path'
import util from 'util'

import chalk from 'chalk'
import figures from 'figures'
import webpack from 'webpack'

import {CONFIG_FILE_NAME, INFERNO_APP, PREACT_APP, PROJECT_TYPES} from './constants'
import {COMPAT_CONFIGS} from './createWebpackConfig'
import debug from './debug'
import {ConfigValidationError} from './errors'
import {deepToString, joinAnd, replaceArrayMerge, typeOf} from './utils'

const DEFAULT_REQUIRED = false

const BABEL_RUNTIME_OPTIONS = new Set(['helpers', 'polyfill'])
const DEFAULT_STYLE_LOADERS = new Set(['css', 'postcss'])

let s = (n, w = ',s') => w.split(',')[n === 1 ? 0 : 1]

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

function checkForRedundantCompatAliases(projectType, aliases, configPath, report) {
  if (!new Set([INFERNO_APP, PREACT_APP]).has(projectType)) return
  if (!aliases) return

  let compatModule = `${projectType.split('-')[0]}-compat`
  if (aliases.react && aliases.react.includes(compatModule)) {
    report.hint(`${configPath}.react`,
      `nwb aliases ${chalk.yellow('react')} to ${chalk.green(compatModule)} by default, so you can remove this config.`
    )
  }
  if (aliases['react-dom'] && aliases['react-dom'].includes(compatModule)) {
    report.hint(`${configPath}.react-dom`,
      `nwb aliases ${chalk.yellow('react-dom')} to ${chalk.green(compatModule)} by default, so you can remove this config.`
    )
  }
}

/**
 * Load a user config file to get its project type. If we need to check the
 * project type, a config file must exist.
 */
export function getProjectType(args = {}) {
  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let userConfigPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file doesn't exist
  let configFileExists = fs.existsSync(userConfigPath)
  if (!configFileExists) {
    throw new Error(`Couldn't find a config file at ${userConfigPath} to determine project type.`)
  }

  try {
    userConfig = require(userConfigPath)
    // Delete the file from the require cache as it may be imported multiple
    // times with a different NODE_ENV in place depending on the command.
    delete require.cache[userConfigPath]
  }
  catch (e) {
    throw new Error(`Couldn't import the config file at ${userConfigPath}: ${e.message}\n${e.stack}`)
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

  let report = new UserConfigReport(userConfigPath)

  if (!PROJECT_TYPES.has(userConfig.type)) {
    report.error('type', userConfig.type, `Must be one of: ${[...PROJECT_TYPES].join(', ')}`)
  }
  if (report.hasErrors()) {
    throw new ConfigValidationError(report)
  }

  return userConfig.type
}

/**
 * Move loader options into an options object, allowing users to provide flatter
 * config.
 */
export function prepareWebpackRuleConfig(rules) {
  Object.keys(rules).forEach(ruleId => {
    let rule = rules[ruleId]
    // XXX Special case for stylus-loader, which uses a 'use' option for plugins
    if ((rule.use && !/stylus$/.test(ruleId)) || rule.options) return
    let {
      exclude, include, test, loader, // eslint-disable-line no-unused-vars
      ...options
    } = rule
    if (Object.keys(options).length > 0) {
      rule.options = options
      Object.keys(options).forEach(prop => delete rule[prop])
    }
  })
}

/**
 * Move loader options into a loaders object, allowing users to provide flatter
 * config.
 */
export function prepareWebpackStyleConfig(styles) {
  Object.keys(styles).forEach(type => {
    styles[type].forEach(styleConfig => {
      let {
        exclude, include, // eslint-disable-line no-unused-vars
        ...loaderConfig
      } = styleConfig
      if (Object.keys(loaderConfig).length > 0) {
        styleConfig.loaders = {}
        Object.keys(loaderConfig).forEach(loader => {
          styleConfig.loaders[loader] = {options: styleConfig[loader]}
          delete styleConfig[loader]
        })
      }
    })
  })
}

// TODO Remove in a future version
let warnedAboutOldStyleRules = false

/**
 * Validate user config and perform any necessary validation and transformation
 * to it.
 */
export function processUserConfig({
    args = {},
    check = false,
    pluginConfig = {},
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

  if ((required || 'type' in userConfig) && !PROJECT_TYPES.has(userConfig.type)) {
    report.error('type', userConfig.type, `Must be one of: ${[...PROJECT_TYPES].join(', ')}`)
  }

  let argumentOverrides = {}
  void ['babel', 'devServer', 'karma', 'npm', 'webpack'].forEach(prop => {
    // Set defaults for top-level config objects so we don't have to
    // existence-check them everywhere.
    if (!(prop in userConfig)) {
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
  }

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
  if (userConfig.babel.presets) {
    if (typeOf(userConfig.babel.presets) === 'string') {
      userConfig.babel.presets = [userConfig.babel.presets]
    }
    else if (typeOf(userConfig.babel.presets) !== 'array') {
      report.error('babel.presets', userConfig.babel.presets, `Must be a string or an ${chalk.cyan('Array')}`)
    }
  }
  if (userConfig.babel.plugins) {
    if (typeOf(userConfig.babel.plugins) === 'string') {
      userConfig.babel.plugins = [userConfig.babel.plugins]
    }
    else if (typeOf(userConfig.babel.plugins) !== 'array') {
      report.error('babel.plugins', userConfig.babel.plugins, `Must be a string or an ${chalk.cyan('Array')}`)
    }
  }
  if ('runtime' in userConfig.babel &&
      typeOf(userConfig.babel.runtime) !== 'boolean' &&
      !BABEL_RUNTIME_OPTIONS.has(userConfig.babel.runtime)) {
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
  // noop

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

    if (userConfig.webpack.compat.intl) {
      if (typeOf(userConfig.webpack.compat.intl.locales) === 'string') {
        userConfig.webpack.compat.intl.locales = [userConfig.webpack.compat.intl.locales]
      }
      else if (typeOf(userConfig.webpack.compat.intl.locales) !== 'array') {
        report.error(
          'webpack.compat.intl.locales',
          webpack.compat.intl.locales,
          'Must be a string or an Array.'
        )
      }
    }

    if (userConfig.webpack.compat.moment) {
      if (typeOf(userConfig.webpack.compat.moment.locales) === 'string') {
        userConfig.webpack.compat.moment.locales = [userConfig.webpack.compat.moment.locales]
      }
      else if (typeOf(userConfig.webpack.compat.moment.locales) !== 'array') {
        report.error(
          'webpack.compat.moment.locales',
          webpack.compat.moment.locales,
          'Must be a string or an Array.'
        )
      }
    }

    if (userConfig.webpack.compat['react-intl']) {
      if (typeOf(userConfig.webpack.compat['react-intl'].locales) === 'string') {
        userConfig.webpack.compat['react-intl'].locales =
          [userConfig.webpack.compat['react-intl'].locales]
      }
      else if (typeOf(userConfig.webpack.compat['react-intl'].locales) !== 'array') {
        report.error(
          'webpack.compat[\'react-intl\'].locales',
          webpack.compat['react-intl'].locales,
          'Must be a string or an Array.'
        )
      }
    }
  }

  if (userConfig.webpack.vendorBundle === false) {
    report.error(
      'webpack.vendorBundle',
      webpack.vendorBundle,
      'No longer supported - add a --no-vendor flag to your build command instead.'
    )
  }

  if ('rules' in userConfig.webpack) {
    if (typeOf(userConfig.webpack.rules) !== 'object') {
      report.error(
        'webpack.rules',
        `type: ${typeOf(userConfig.webpack.rules)}`,
        'Must be an Object.'
      )
    }
    else {
      let error = false
      Object.keys(userConfig.webpack.rules).forEach(ruleId => {
        let rule = userConfig.webpack.rules[ruleId]
        if (rule.use && typeOf(rule.use) !== 'array') {
          report.error(
            `webpack.rules.${ruleId}.use`,
            `type: ${typeOf(rule.use)}`,
            'Must be an Array.'
          )
          error = true
        }
      })
      if (!error) {
        prepareWebpackRuleConfig(userConfig.webpack.rules)
      }
    }
  }

  if ('styles' in userConfig.webpack) {
    let configType = typeOf(userConfig.webpack.styles)
    if (configType === 'string' && userConfig.webpack.styles !== 'old') {
      report.error(
        'webpack.styles',
        userConfig.webpack.styles,
        `Must be ${chalk.green("'old'")} (to use default style rules from nwb <= v0.15), ${chalk.green('false')} or an Object.`
      )
      if (!warnedAboutOldStyleRules) {
        report.deprecated('webpack.styles', 'Support for default style rules from nwb <= v0.15 will be removed in a future release.')
        warnedAboutOldStyleRules = true
      }
    }
    else if (configType === 'boolean' && userConfig.webpack.styles !== false) {
      report.error(
        'webpack.styles',
        userConfig.webpack.styles,
        `Must be ${chalk.green("'old'")}, ${chalk.green('false')} (to disable default style rules) or an Object.`
      )
    }
    else if (configType !== 'object' && configType !== 'boolean') {
      report.error(
        'webpack.styles',
        `type: ${configType}`,
        `Must be ${chalk.green("'old'")}, ${chalk.green('false')} or an Object (to configure custom style rules).`
      )
    }
    else {
      let styleTypeIds = ['css']
      if (pluginConfig.cssPreprocessors) {
        styleTypeIds = styleTypeIds.concat(Object.keys(pluginConfig.cssPreprocessors))
      }
      let error = false
      Object.keys(userConfig.webpack.styles).forEach(styleType => {
        if (styleTypeIds.indexOf(styleType) === -1) {
          report.error(
            'webpack.styles',
            `property: ${styleType}`,
            `Unknown style type - must be ${joinAnd(styleTypeIds.map(chalk.green), 'or')}`
          )
          error = true
        }
        else if (typeOf(userConfig.webpack.styles[styleType]) !== 'array') {
          report.error(
            `webpack.styles.${styleType}`,
            `type: ${typeOf(userConfig.webpack.styles[styleType])}`,
            `Must be an Array - if you don't need multiple custom rules, configure the defaults via ${chalk.green('webpack.rules')} instead.`
          )
          error = true
        }
        else {
          userConfig.webpack.styles[styleType].forEach((styleConfig, index) => {
            let {
              test, include, exclude, // eslint-disable-line no-unused-vars
              ...loaderConfig
            } = styleConfig
            Object.keys(loaderConfig).forEach(loaderId => {
              if (!DEFAULT_STYLE_LOADERS.has(loaderId) && loaderId !== styleType) {
                // XXX Assumption: preprocessors provide a single loader which
                //     is configured with the same id as the style type id.
                let ids = joinAnd([...new Set([...DEFAULT_STYLE_LOADERS, loaderId])].map(id => chalk.green(id)), 'or')
                report.error(
                  `webpack.styles.${styleType}[${index}]`,
                  `property: ${loaderId}`,
                  `Must be ${chalk.green('include')}, ${chalk.green('exclude')} and available loader ids: ${ids}`
                )
                error = true
              }
            })
          })
        }
      })
      if (!error) {
        prepareWebpackStyleConfig(userConfig.webpack.styles, pluginConfig)
      }
    }
  }

  checkForRedundantCompatAliases(
    userConfig.type,
    userConfig.webpack.aliases,
    'webpack.aliases',
    report
  )

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
      checkForRedundantCompatAliases(
        userConfig.type,
        userConfig.webpack.extra.resolve.alias,
        'webpack.extra.resolve.alias',
        report
      )
    }
  }

  if ('config' in userConfig.webpack && typeOf(userConfig.webpack.config) !== 'function') {
    report.error(
      `webpack.config`,
      `type: ${typeOf(userConfig.webpack.config)}`,
      'Must be a Function.'
     )
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
    pluginConfig = {}, // eslint-disable-line no-unused-vars
    required = DEFAULT_REQUIRED,
  } = options
  // Try to load default user config, or use a config file path we were given
  let userConfig = {}
  let userConfigPath = path.resolve(args.config || CONFIG_FILE_NAME)

  // Bail early if a config file is required and doesn't exist
  let configFileExists = fs.existsSync(userConfigPath)
  if ((args.config || required) && !configFileExists) {
    throw new Error(`Couldn't find a config file at ${userConfigPath}`)
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
      throw new Error(`Couldn't import the config file at ${userConfigPath}: ${e.message}\n${e.stack}`)
    }
  }

  userConfig = processUserConfig({args, check, pluginConfig, required, userConfig, userConfigPath})

  if (configFileExists) {
    userConfig.path = userConfigPath
  }

  return userConfig
}
