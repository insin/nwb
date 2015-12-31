#!/usr/bin/env node

import chalk from 'chalk'

import cli from '../cli'
import {UserError} from '../errors'

let error

try {
  cli(process.argv.slice(2), err => (err) ? process.exit(1) : error = err)
}
catch (err) {
  error = err
}

// Assumption: error will be undefined or null on success
if (error != null) {
  if (error instanceof UserError) {
    console.error(chalk.red(error.message))
  }
  else {
    console.error(chalk.red('nwb: error running command:'))
    console.error(error.stack)
  }
  process.exit(1)
}
