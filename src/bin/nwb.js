#!/usr/bin/env node

import cli from '../cli'

try {
  cli(process.argv.slice(2))
}
catch (e) {
  console.error('nwb: error running command:')
  console.error(e.stack)
  process.exit(1)
}
