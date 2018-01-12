import util from 'util'

import chalk from 'chalk'
import figures from 'figures'

import {padLines, pluralise as s} from '../utils'

export default class UserConfigReport {
  constructor({configFileExists, configPath} = {}) {
    this.configFileExists = configFileExists
    this.configPath = configPath
    this.deprecations = []
    this.errors = []
    this.hints = []
    this.hasArgumentOverrides = false
  }

  deprecated(path, ...messages) {
    this.deprecations.push({path, messages})
  }

  error(path, value, ...messages) {
    this.errors.push({path, value, message: messages.join('\n')})
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

  getConfigSource() {
    if (this.configFileExists) {
      let description = this.configPath
      if (this.hasArgumentOverrides) {
        description += ' (with CLI argument overrides)'
      }
      return description
    }
    else if (this.hasArgumentOverrides) {
      return 'config via CLI arguments'
    }
    return 'funsies'
  }

  getReport() {
    let report = []

    report.push(chalk.underline(`nwb config report for ${this.getConfigSource()}`))
    report.push('')

    if (!this.hasSomethingToReport()) {
      report.push(chalk.green(`${figures.tick} Nothing to report!`))
      return report.join('\n')
    }

    if (this.errors.length) {
      let count = this.errors.length > 1 ? `${this.errors.length} ` : ''
      report.push(chalk.red.underline(`${count}Error${s(this.errors.length)}`))
      report.push('')
    }
    this.errors.forEach(({path, value, message}) => {
      report.push(`${chalk.red(`${figures.cross} ${path}`)}${value ? ` ${chalk.cyan('=')} ${util.inspect(value)}` : ''}`)
      report.push(padLines(message))
      report.push('')
    })

    if (this.deprecations.length) {
      let count = this.deprecations.length > 1 ? `${this.deprecations.length} ` : ''
      report.push(chalk.yellow.underline(`${count}Deprecation Warning${s(this.deprecations.length)}`))
      report.push('')
    }
    this.deprecations.forEach(({path, messages}) => {
      report.push(chalk.yellow(`${figures.warning} ${path}`))
      messages.forEach(message => {
        report.push(`  ${message}`)
      })
      report.push('')
    })

    if (this.hints.length) {
      let count = this.hints.length > 1 ? `${this.hints.length} ` : ''
      report.push(chalk.cyan.underline(`${count}Hint${s(this.hints.length)}`))
      report.push('')
    }
    this.hints.forEach(({path, messages}) => {
      report.push(chalk.cyan(`${figures.info} ${path}`))
      messages.forEach(message => {
        report.push(`  ${message}`)
      })
      report.push('')
    })

    return report.join('\n')
  }

  log() {
    console.log(this.getReport())
  }
}
