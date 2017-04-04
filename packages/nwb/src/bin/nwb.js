#!/usr/bin/env node

import {red} from 'chalk'

import cli from '../cli'
import {ConfigValidationError, KarmaExitCodeError, UserError} from '../errors'

function handleError(error) {
  if (error instanceof UserError) {
    console.error(red(error.message))
  }
  else if (error instanceof ConfigValidationError) {
    error.report.log()
  }
  else if (error instanceof KarmaExitCodeError) {
    console.error(red(`Karma exit code was ${error.exitCode}`))
  }
  else {
    console.error(red(`Error running command: ${error.message}`))
    if (error.stack) {
      console.error(error.stack)
    }
  }
  process.exit(1)
}

try {
  cli(process.argv.slice(2), err => {
    if (err) handleError(err)
    process.exit(0)
  })
}
catch (e) {
  handleError(e)
}
