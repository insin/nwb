import chalk from 'chalk'

import {pluralise as s, typeOf} from '../utils'

export function processNpmBuildConfig({report, userConfig}) {
  let {
    cjs,
    esModules,
    umd,
    ...unexpectedConfig
  } = userConfig.npm

  let unexpectedProps = Object.keys(unexpectedConfig)
  if (unexpectedProps.length > 0) {
    report.error(
      'npm',
      unexpectedProps.join(', '),
      `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('babel')} config - ` +
      'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#npm-build-configuration for supported config'
    )
  }

  // cjs
  if ('cjs' in userConfig.npm) {
    if (typeOf(cjs) !== 'boolean') {
      report.error(
        'npm.cjs',
        cjs,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // esModules
  if ('esModules' in userConfig.npm) {
    if (typeOf(esModules) !== 'boolean') {
      report.error(
        'npm.esModules',
        esModules,
        `Must be ${chalk.cyan('Boolean')}`
      )
    }
  }

  // umd
  if ('umd' in userConfig.npm) {
    if (umd === false) {
      // ok
    }
    else if (typeOf(umd) === 'string') {
      userConfig.npm.umd = {global: umd}
    }
    else if (typeOf(umd) !== 'object') {
      report.error(
        'npm.umd',
        umd,
        `Must be a ${chalk.cyan('String')} (for ${chalk.cyan('global')} ` +
        `config only)}, an ${chalk.cyan('Object')} (for any UMD build options) ` +
        `or ${chalk.cyan('false')} (to explicitly disable the UMD build)`
      )
    }
    else {
      let {
        entry,
        global: umdGlobal,
        externals,
        ...unexpectedConfig
      } = umd

      let unexpectedProps = Object.keys(unexpectedConfig)
      if (unexpectedProps.length > 0) {
        report.error(
          'npm.umd',
          unexpectedProps.join(', '),
          `Unexpected prop${s(unexpectedProps.length)} in ${chalk.cyan('npm.umd')} config - ` +
          'see https://github.com/insin/nwb/blob/master/docs/Configuration.md#umd-string--object for supported config'
        )
      }

      if ('entry' in umd && typeOf(entry) !== 'string') {
        report.error(
          'npm.umd.entry',
          entry,
          `Must be a ${chalk.cyan('String')}`
        )
      }

      if ('global' in umd && typeOf(umdGlobal) !== 'string') {
        report.error(
          'npm.umd.global',
          umdGlobal,
          `Must be a ${chalk.cyan('String')}`
        )
      }

      if ('externals' in umd && typeOf(externals) !== 'object') {
        report.error(
          'npm.umd.externals',
          externals,
          `Must be an ${chalk.cyan('Object')}`
        )
      }
    }
  }
}
