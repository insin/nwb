#!/usr/bin/env node

import {red} from 'chalk'

import cli from '../cli'
import {ConfigValidationErrors, UserError} from '../errors'
import {logConfigValidationErrors} from '../utils'

function handleError(error) {
  if (error instanceof UserError) {
    console.error(red(error.message))
  }
  else if (error instanceof ConfigValidationErrors) {
    logConfigValidationErrors(error)
  }
  else {
    console.error(red('nwb: error running command'))
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
