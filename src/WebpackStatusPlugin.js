import chalk from 'chalk'

import {clearConsole} from './utils'
import {logErrorsAndWarnings} from './webpackUtils'

/**
 * Display current build status for a Webpack watch build.
 * Based on create-react-app@0.2's start script.
 */
export default class StatusPlugin {
  constructor({message = '', middleware = false, test = false} = {}) {
    // Provides details of the URL the dev server is available at
    this.message = message
    // Flag: don't clear the console as we're in someone else's server
    this.middleware = middleware
    // Flag: ONLY log errors and warnings
    this.test = test

    // We only want to display the "Starting..." message once
    this.initial = true

    this.watchRun = this.watchRun.bind(this)
    this.done = this.done.bind(this)
  }

  apply(compiler) {
    compiler.plugin('watch-run', this.watchRun)
    compiler.plugin('done', this.done)
  }

  clearConsole() {
    if (!this.test) {
      clearConsole()
    }
  }

  log(message) {
    if (!this.test) {
      console.log(message)
    }
  }

  watchRun(watching, cb) {
    if (!this.middleware) {
      this.clearConsole()
    }
    if (this.initial) {
      this.log(chalk.cyan('Starting Webpack compilation...'))
      this.initial = false
    }
    else {
      this.log('Recompiling...')
    }
    cb()
  }

  done(stats) {
    if (!this.middleware) {
      this.clearConsole()
    }

    let hasErrors = stats.hasErrors()
    let hasWarnings = stats.hasWarnings()

    if (!hasErrors && !hasWarnings) {
      this.log(chalk.green('Compiled successfully.'))
    }
    else {
      logErrorsAndWarnings(stats)
      if (hasErrors) return
    }

    if (!this.middleware) {
      this.log('')
      this.log(this.message)
    }
  }
}
