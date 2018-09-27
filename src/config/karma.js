import fs from 'fs'

import chalk from 'chalk'

import {pluralise as s, typeOf} from '../utils'

export function processKarmaConfig({report, userConfig}) {
  let {
    browsers,
    excludeFromCoverage,
    frameworks,
    plugins,
    reporters,
    testContext,
    testFiles,
    extra,
    config,
    ...unexpectedConfig
  } = userConfig.karma

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'karma',
      unexpectedProps.join(', '),
      `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('karma')} config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#karma-configuration for supported config.' +
      `If you were trying to add extra Karma config, try putting it in ${chalk.cyan('karma.extra')} instead`
    )
  }

  // browsers
  if ('browsers' in userConfig.karma) {
    if (typeOf(browsers) !== 'array') {
      report.error(
        'karma.browsers',
        browsers,
        `Must be an ${chalk.cyan('Array')}`
      )
    }
  }

  // excludeFromCoverage
  if ('excludeFromCoverage' in userConfig.karma) {
    if (typeOf(excludeFromCoverage) === 'string') {
      userConfig.karma.excludeFromCoverage = [excludeFromCoverage]
    }
    else if (typeOf(excludeFromCoverage) !== 'array') {
      report.error(
        'karma.excludeFromCoverage',
        excludeFromCoverage,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // frameworks
  if ('frameworks' in userConfig.karma) {
    if (typeOf(frameworks) !== 'array') {
      report.error(
        'karma.frameworks',
        frameworks,
        `Must be an ${chalk.cyan('Array')}`
      )
    }
  }

  // plugins
  if ('plugins' in userConfig.karma) {
    if (typeOf(plugins) !== 'array') {
      report.error(
        'karma.plugins',
        plugins,
        `Must be an ${chalk.cyan('Array')}`
      )
    }
  }

  // reporters
  if ('reporters' in userConfig.karma) {
    if (typeOf(reporters) !== 'array') {
      report.error(
        'karma.reporters',
        reporters,
        `Must be an ${chalk.cyan('Array')}`
      )
    }
  }

  // testContext
  if ('testContext' in userConfig.karma) {
    if (typeOf(testContext) !== 'string') {
      report.error(
        'karma.testContext',
        testContext,
        `Must be a ${chalk.cyan('String')}`
      )
    }
    else if (!fs.existsSync(testContext)) {
      report.error(
        'karma.testContext',
        testContext,
        `The specified test context module does not exist`
      )
    }
  }

  // testFiles
  if ('testFiles' in userConfig.karma) {
    if (typeOf(testFiles) === 'string') {
      userConfig.karma.testFiles = [testFiles]
    }
    else if (typeOf(testFiles) !== 'array') {
      report.error(
        'karma.testFiles',
        testFiles,
        `Must be a ${chalk.cyan('String')} or an ${chalk.cyan('Array')}`
      )
    }
  }

  // extra
  if ('extra' in userConfig.karma) {
    if (typeOf(extra) !== 'object') {
      report.error(
        'karma.extra',
        `type: ${typeOf(extra)}`,
        `Must be an ${chalk.cyan('Object')}`
      )
    }
  }

  // config
  if ('config' in userConfig.karma && typeOf(config) !== 'function') {
    report.error(
      `karma.config`,
      `type: ${typeOf(config)}`,
      `Must be a ${chalk.cyan('Function')}`
    )
  }
}
