import chalk from 'chalk'

import {INFERNO_APP, PREACT_APP} from '../constants'
import {COMPAT_CONFIGS} from '../createWebpackConfig'
import {joinAnd, pluralise as s, typeOf} from '../utils'

const DEFAULT_STYLE_LOADERS = new Set(['css', 'postcss'])

let warnedAboutAutoPrefixerString = false

export function processWebpackConfig({pluginConfig, report, userConfig}) {
  let {
    aliases,
    autoprefixer,
    compat,
    copy,
    debug,
    define,
    extractCSS,
    html,
    install,
    publicPath,
    rules,
    styles,
    terser,
    extra,
    config,
    ...unexpectedConfig
  } = userConfig.webpack

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'webpack',
      unexpectedProps.join(', '),
      `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('webpack')} config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#webpack-configuration for supported config. ' +
      `If you were trying to add extra Webpack config, try putting it in ${chalk.cyan('webpack.extra')} instead`
    )
  }

  // aliases
  if ('aliases' in userConfig.webpack) {
    if (typeOf(aliases) !== 'object') {
      report.error(
        'webpack.aliases',
        `type: ${typeOf(aliases)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
    else {
      checkForRedundantCompatAliases(
        userConfig.type,
        aliases,
        'webpack.aliases',
        report
      )
    }
  }

  // autoprefixer
  if ('autoprefixer' in userConfig.webpack) {
    // TODO Deprecated - remove
    if (typeOf(autoprefixer) === 'string') {
      if (!warnedAboutAutoPrefixerString) {
        report.deprecated(
          'webpack.autoprefixer as a String',
          'Replaced by top-level "browsers" config in nwb v0.25.0 - webpack.autoprefixer can no longer be a String',
        )
        warnedAboutAutoPrefixerString = true
      }
      userConfig.webpack.autoprefixer = {}
    }
    else if (typeOf(autoprefixer) !== 'object') {
      report.error(
        'webpack.autoprefixer',
        `type: ${typeOf(autoprefixer)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // compat
  if ('compat' in userConfig.webpack) {
    if (typeOf(compat) !== 'object') {
      report.error(
        'webpack.compat',
        `type: ${typeOf(compat)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
    else {
      // Validate compat props
      let compatProps = Object.keys(compat)
      let unexpectedCompatProps = compatProps.filter(prop => !(prop in COMPAT_CONFIGS))
      if (unexpectedCompatProps.length > 0) {
        report.error(
          'webpack.compat',
          unexpectedCompatProps.join(', '),
          `Unexpected prop${s(unexpectedCompatProps.length)} in ${chalk.cyan('webpack.compat')}. ` +
          `Valid props are: ${joinAnd(Object.keys(COMPAT_CONFIGS).map(p => chalk.cyan(p)), 'or')}`)
      }

      void ['intl', 'moment', 'react-intl'].forEach(compatProp => {
        if (!(compatProp in compat)) return
        let config = compat[compatProp]
        let configType = typeOf(config)
        if (configType === 'string') {
          compat[compatProp] = {locales: [config]}
        }
        else if (configType === 'array') {
          compat[compatProp] = {locales: config}
        }
        else if (configType === 'object') {
          if (typeOf(config.locales) === 'string') {
            config.locales = [config.locales]
          }
          else if (typeOf(config.locales) !== 'array') {
            report.error(
              `webpack.compat.${compatProp}.locales`,
              config.locales,
              `Must be a ${chalk.cyan('String')} (single locale name) or an ${chalk.cyan('Array')} of locales`
            )
          }
        }
        else {
          report.error(
            `webpack.compat.${compatProp}`,
            `type: ${configType}`,
            `Must be a ${chalk.cyan('String')} (single locale name), an ${chalk.cyan('Array')} ` +
            `of locales or an ${chalk.cyan('Object')} with a ${chalk.cyan('locales')} property - ` +
            'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#compat-object '
          )
        }
      })
    }
  }

  // copy
  if ('copy' in userConfig.webpack) {
    if (typeOf(copy) === 'array') {
      userConfig.webpack.copy = {patterns: copy}
    }
    else if (typeOf(copy) === 'object') {
      if (!copy.patterns && !copy.options) {
        report.error(
          'webpack.copy',
          copy,
          `Must include ${chalk.cyan('patterns')} or ${chalk.cyan('options')}`
        )
      }
      if (copy.patterns && typeOf(copy.patterns) !== 'array') {
        report.error(
          'webpack.copy.patterns',
          copy.patterns,
          `Must be an ${chalk.cyan('Array')}`
        )
      }
      if (copy.options && typeOf(copy.options) !== 'object') {
        report.error(
          'webpack.copy.options',
          copy.options,
          `Must be an ${chalk.cyan('Object')}`
        )
      }
    }
    else {
      report.error(
        'webpack.copy',
        copy,
        `Must be an ${chalk.cyan('Array')} or an ${chalk.cyan('Object')}`
      )
    }
  }

  // debug
  if (debug) {
    // Make it harder for the user to forget to disable the production debug build
    // if they've enabled it in the config file.
    report.hint('webpack.debug',
      "Don't forget to disable the debug build before building for production"
    )
  }

  // define
  if ('define' in userConfig.webpack) {
    if (typeOf(define) !== 'object') {
      report.error(
        'webpack.define',
        `type: ${typeOf(define)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // extractCSS
  if ('extractCSS' in userConfig.webpack) {
    let configType = typeOf(extractCSS)
    let help = `Must be ${chalk.cyan('false')} (to disable CSS extraction) or ` +
               `an ${chalk.cyan('Object')} (to configure MiniCssExtractPlugin)`
    if (configType === 'boolean') {
      if (extractCSS !== false) {
        report.error('webpack.extractCSS', extractCSS, help)
      }
    }
    else if (configType !== 'object') {
      report.error('webpack.extractCSS', `type: ${configType}`, help)
    }
  }

  // html
  if ('html' in userConfig.webpack) {
    if (typeOf(html) !== 'object') {
      report.error(
        'webpack.html',
        `type: ${typeOf(html)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // install
  if ('install' in userConfig.webpack) {
    if (typeOf(install) !== 'object') {
      report.error(
        'webpack.install',
        `type: ${typeOf(install)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // publicPath
  if ('publicPath' in userConfig.webpack) {
    if (typeOf(publicPath) !== 'string') {
      report.error(
        'webpack.publicPath',
        `type: ${typeOf(publicPath)}`,
        `Must be a ${chalk.cyan('String')}`
      )
    }
  }

  // rules
  if ('rules' in userConfig.webpack) {
    if (typeOf(rules) !== 'object') {
      report.error(
        'webpack.rules',
        `type: ${typeOf(rules)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
    else {
      let error = false
      Object.keys(rules).forEach(ruleId => {
        let rule = rules[ruleId]
        if (rule.use && typeOf(rule.use) !== 'array') {
          report.error(
            `webpack.rules.${ruleId}.use`,
            `type: ${typeOf(rule.use)}`,
            `Must be an ${chalk.cyan('Array')}`
          )
          error = true
        }
      })
      if (!error) {
        prepareWebpackRuleConfig(rules)
      }
    }
  }

  // styles
  if ('styles' in userConfig.webpack) {
    let configType = typeOf(styles)
    let help = `Must be an ${chalk.cyan('Object')} (to configure custom style rules) ` +
               `or ${chalk.cyan('false')} (to disable style rules)`
    if (configType === 'boolean' && styles !== false) {
      report.error('webpack.styles', styles, help)
    }
    else if (configType !== 'object' && configType !== 'boolean') {
      report.error('webpack.styles', `type: ${configType}`, help)
    }
    else {
      let styleTypeIds = ['css']
      if (pluginConfig.cssPreprocessors) {
        styleTypeIds = styleTypeIds.concat(Object.keys(pluginConfig.cssPreprocessors))
      }
      let error = false
      Object.keys(styles).forEach(styleType => {
        if (styleTypeIds.indexOf(styleType) === -1) {
          report.error(
            'webpack.styles',
            `property: ${styleType}`,
            `Unknown style type - must be ${joinAnd(styleTypeIds.map(s => chalk.cyan(s)), 'or')}`
          )
          error = true
        }
        else if (typeOf(styles[styleType]) !== 'array') {
          report.error(
            `webpack.styles.${styleType}`,
            `type: ${typeOf(styles[styleType])}`,
            `Must be an ${chalk.cyan('Array')} - if you don't need multiple custom rules, ` +
            `configure the defaults via ${chalk.cyan('webpack.rules')} instead`
          )
          error = true
        }
        else {
          styles[styleType].forEach((styleConfig, index) => {
            let {
              test, include, exclude, // eslint-disable-line no-unused-vars
              ...loaderConfig
            } = styleConfig
            Object.keys(loaderConfig).forEach(loaderId => {
              if (!DEFAULT_STYLE_LOADERS.has(loaderId) && loaderId !== styleType) {
                // XXX Assumption: preprocessors provide a single loader which is configured with the same id as the style type id
                let loaderIds = Array.from(new Set([
                  ...Array.from(DEFAULT_STYLE_LOADERS),
                  styleType
                ])).map(id => chalk.cyan(id))
                report.error(
                  `webpack.styles.${styleType}[${index}]`,
                  `property: ${loaderId}`,
                  `Must be ${chalk.cyan('include')}, ${chalk.cyan('exclude')} or a loader id: ${joinAnd(loaderIds, 'or')}`
                )
                error = true
              }
            })
          })
        }
      })
      if (!error) {
        prepareWebpackStyleConfig(styles)
      }
    }
  }

  // terser
  if ('terser' in userConfig.webpack) {
    if (terser !== false && typeOf(terser) !== 'object') {
      report.error(
        `webpack.terser`,
        terser,
        `Must be ${chalk.cyan('false')} (to disable terser-webpack-plugin) or ` +
        `an ${chalk.cyan('Object')} (to configure terser-webpack-plugin)`
      )
    }
  }

  // extra
  if ('extra' in userConfig.webpack) {
    if (typeOf(extra) !== 'object') {
      report.error(
        'webpack.extra',
        `type: ${typeOf(extra)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
    else {
      if (typeOf(extra.output) === 'object' && extra.output.publicPath) {
        report.hint('webpack.extra.output.publicPath',
          `You can use the more convenient ${chalk.cyan('webpack.publicPath')} config instead`
        )
      }
      if (typeOf(extra.resolve) === 'object' && extra.resolve.alias) {
        report.hint('webpack.extra.resolve.alias',
          `You can use the more convenient ${chalk.cyan('webpack.aliases')} config instead`
        )
        checkForRedundantCompatAliases(
          userConfig.type,
          extra.resolve.alias,
          'webpack.extra.resolve.alias',
          report
        )
      }
    }
  }

  // config
  if ('config' in userConfig.webpack && typeOf(config) !== 'function') {
    report.error(
      `webpack.config`,
      `type: ${typeOf(config)}`,
      `Must be a ${chalk.cyan('Function')}`
    )
  }
}

/**
 * Tell the user if they've manually set up the same React compatibility aliases
 * nwb configured by default.
 */
function checkForRedundantCompatAliases(projectType, aliases, configPath, report) {
  if (!new Set([INFERNO_APP, PREACT_APP]).has(projectType)) return

  let compatModule = `${projectType.split('-')[0]}-compat`
  if (aliases.react && aliases.react.includes(compatModule)) {
    report.hint(`${configPath}.react`,
      `nwb aliases ${chalk.yellow('react')} to ${chalk.cyan(compatModule)} by default, so you can remove this config`
    )
  }
  if (aliases['react-dom'] && aliases['react-dom'].includes(compatModule)) {
    report.hint(`${configPath}.react-dom`,
      `nwb aliases ${chalk.yellow('react-dom')} to ${chalk.cyan(compatModule)} by default, so you can remove this config`
    )
  }
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
