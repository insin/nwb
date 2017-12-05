// @flow
import chalk from 'chalk'

import {clearConsole} from './utils'
import {logErrorsAndWarnings} from './webpackUtils'

import type {ErrBack} from './types'

type StatusPluginOptions = {
  disableClearConsole?: boolean,
  quiet?: boolean,
  successMessage?: ?string,
};

/**
 * Display build status for a Webpack watching build.
 */
export default class StatusPlugin {
  disableClearConsole: boolean;
  quiet: boolean;
  successMessage: ?string;
  isInitialBuild: boolean;

  constructor(options: StatusPluginOptions = {}) {
    let {
      disableClearConsole = false,
      quiet = false,
      successMessage = '',
    } = options

    this.disableClearConsole = disableClearConsole
    this.quiet = quiet
    this.successMessage = successMessage

    // We only want to display the "Starting..." message once
    this.isInitialBuild = true
  }

  apply(compiler: Object) {
    compiler.hooks.watchRun.tapAsync('StatusPlugin', this.watchRun)
    compiler.hooks.done.tap('StatusPlugin', this.done)
  }

  clearConsole() {
    if (!this.quiet && !this.disableClearConsole) {
      clearConsole()
    }
  }

  log(message: any) {
    if (!this.quiet) {
      console.log(message)
    }
  }

  watchRun = (compiler: Object, cb: ErrBack) => {
    this.clearConsole()
    if (this.isInitialBuild) {
      this.log(chalk.cyan('Starting Webpack compilation...'))
      this.isInitialBuild = false
    }
    else {
      this.log('Recompiling...')
    }
    cb()
  }

  done = (stats: Object) => {
    this.clearConsole()

    let hasErrors = stats.hasErrors()
    let hasWarnings = stats.hasWarnings()

    if (!hasErrors && !hasWarnings) {
      let time = stats.endTime - stats.startTime
      this.log(chalk.green(`Compiled successfully in ${time} ms.`))
    }
    else {
      logErrorsAndWarnings(stats)
      if (hasErrors) return
    }

    if (this.successMessage) {
      this.log('')
      this.log(this.successMessage)
    }
  }
}
