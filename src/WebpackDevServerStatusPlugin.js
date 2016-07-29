import chalk from 'chalk'

import {clearConsole} from './utils'
import {logErrorsAndWarnings} from './webpackUtils'

/**
 * Display current build status for a Webpack development server.
 * Based on create-react-app@0.2's start script.
 */
export default class DevServerStatusPlugin {
  constructor({message = '', middleware = false} = {}) {
    this.message = message
    this.middleware = middleware

    this.done = this.done.bind(this)
    this.invalid = this.invalid.bind(this)
  }

  apply(compiler) {
    compiler.plugin('done', this.done)
    compiler.plugin('invalid', this.invalid)
  }

  /**
   * Triggered when the current build is finished.
   */
  done(stats) {
    if (!this.middleware) {
      clearConsole()
    }

    let hasErrors = stats.hasErrors()
    let hasWarnings = stats.hasWarnings()

    if (!hasErrors && !hasWarnings) {
      console.log(chalk.green('Compiled successfully.'))
    }
    else {
      logErrorsAndWarnings(stats)
      if (hasErrors) return
    }

    if (!this.middleware) {
      console.log()
      console.log(this.message)
    }
  }

  /**
   * Triggered when a file change was detected in watch mode.
   */
  invalid() {
    if (!this.middleware) {
      clearConsole()
    }
    console.log('Recompiling...')
  }
}
