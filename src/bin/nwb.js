#!/usr/bin/env node

import cli from '../cli'
import {UserError} from '../errors'

let error

try {
  cli(process.argv.slice(2), err => error = err)
}
catch (err) {
  error = err
}

// Assumption: error will be undefined or null on success
if (error != null) {
  if (error instanceof UserError) {
    console.error(error.message)
  }
  else {
    console.error('nwb: error running command:')
    console.error(error.stack)
  }
  process.exit(1)
}
