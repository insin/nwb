#!/usr/bin/env node

import chalk from 'chalk'

import cli from '../cli'
import {UserError} from '../errors'

function handleError(error) {
  if (error instanceof UserError) {
    console.error(chalk.red(error.message))
  }
  else {
    console.error(chalk.red('nwb: error running command'))
    if (error.stack) {
      console.error(error.stack)
    }
  }
  process.exit(1)
}

try {
  cli(process.argv.slice(2), err => {
    if (err) handleError(err)
  })
}
catch (e) {
  handleError(e)
}
