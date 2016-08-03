import chalk from 'chalk'

import {clearConsole} from './utils'
import {logErrorsAndWarnings} from './webpackUtils'

/**
 * Display current build status for a Webpack development server.
 * Based on create-react-app@0.2's start script.
 */
export default class DevServerStatusPlugin {
  constructor({message = '', middleware = false} = {}) {
    this.initial = true
    this.message = message
    this.middleware = middleware

    this.watchRun = this.watchRun.bind(this)
    this.done = this.done.bind(this)
  }

  apply(compiler) {
    compiler.plugin('watch-run', this.watchRun)
    compiler.plugin('done', this.done)
  }

  watchRun(watching, cb) {
    if (!this.middleware) {
      clearConsole()
    }
    if (this.initial) {
      console.log(chalk.cyan('Starting Webpack compilation...'))
      this.initial = false
    }
    else {
      console.log('Recompiling...')
    }
    cb()
  }

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
}
