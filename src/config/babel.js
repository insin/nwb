import {validateOptions} from 'babel-preset-proposals'
import chalk from 'chalk'

import {pluralise as s, typeOf} from '../utils'

export function processBabelConfig({report, userConfig}) {
  let {
    cherryPick,
    env,
    loose,
    plugins,
    presets,
    proposals,
    removePropTypes,
    react,
    reactConstantElements,
    runtime,
    config,
    ...unexpectedConfig
  } = userConfig.babel

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'babel',
      unexpectedProps.join(', '),
      `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('babel')} config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#babel-configuration for supported config'
    )
  }

  // cherryPick
  if ('cherryPick' in userConfig.babel) {
    if (typeOf(cherryPick) !== 'string' && typeOf(cherryPick) !== 'array') {
      report.error(
        'babel.cherryPick',
        cherryPick,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // env
  if ('env' in userConfig.babel) {
    if (typeOf(env) !== 'object') {
      report.error(
        'babel.env',
        env,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // loose
  if ('loose' in userConfig.babel) {
    if (typeOf(loose) !== 'boolean') {
      report.error(
        'babel.loose',
        loose,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // plugins
  if ('plugins' in userConfig.babel) {
    if (typeOf(plugins) === 'string') {
      userConfig.babel.plugins = [plugins]
    }
    else if (typeOf(userConfig.babel.plugins) !== 'array') {
      report.error(
        'babel.plugins',
        plugins,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // presets
  if ('presets' in userConfig.babel) {
    if (typeOf(presets) === 'string') {
      userConfig.babel.presets = [presets]
    }
    else if (typeOf(presets) !== 'array') {
      report.error(
        'babel.presets',
        presets,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // proposals
  if ('proposals' in userConfig.babel) {
    if (typeOf(proposals) === 'object') {
      let errors = validateOptions(proposals)
      if (errors.length) {
        report.error('babel.proposals', null, errors.join('\n'))
      }
    }
    else if (proposals !== false) {
      report.error(
        'babel.proposals',
        proposals,
        `Must be an ${chalk.cyan('Object')} (to configure proposal plugins) or ` +
        `${chalk.cyan('false')} (to disable use of proposal plugins)`
      )
    }
  }

  // removePropTypes
  if ('removePropTypes' in userConfig.babel) {
    if (removePropTypes !== false && typeOf(removePropTypes) !== 'object') {
      report.error(
        `babel.removePropTypes`,
        removePropTypes,
        `Must be ${chalk.cyan('false')} (to disable removal of PropTypes) ` +
        `or an ${chalk.cyan('Object')} (to configure react-remove-prop-types)`
      )
    }
  }

  // react
  if ('react' in userConfig.babel) {
    if (typeOf(react) === 'string') {
      userConfig.babel.react = {runtime: react}
    }
    else if (typeOf(react) !== 'object') {
      report.error(
        `babel.react`,
        react,
        `Must be an ${chalk.cyan('Object')} (to configure @babel/preset-react options) ` +
        `or a ${chalk.cyan('String')} (to configure @babel/preset-react's runtime option)`
      )
    }
  }

  // reactConstantElements
  if ('reactConstantElements' in userConfig.babel) {
    if (typeOf(reactConstantElements) !== 'boolean') {
      report.error(
        'babel.reactConstantElements',
        reactConstantElements,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // runtime
  if ('runtime' in userConfig.babel) {
    if (typeOf(runtime) !== 'object' && runtime !== false) {
      report.error(
        'babel.runtime',
        runtime,
        `Must be an ${chalk.cyan('Object')} (to configure transform-runtime options) or ` +
        `${chalk.cyan('false')} (to disable use of the runtime-transform plugin)`
      )
    }
  }

  // config
  if ('config' in userConfig.babel && typeOf(config) !== 'function') {
    report.error(
      `babel.config`,
      `type: ${typeOf(config)}`,
      `Must be a ${chalk.cyan('Function')}`
    )
  }
}
