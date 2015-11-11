#!/usr/bin/env node

var fs = require('fs')
var path = require('path')

var glob = require('glob')
var parseArgs = require('minimist')

var pkg = require('../package.json')

var args = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version'
  },
  boolean: ['help', 'version']
})

if (args.version) {
  console.log('v' + pkg.version)
  process.exit(0)
}
if (args.help || args._.length === 0) {
  console.log('Usage: npb <command>')
  console.log('')
  console.log('Options:')
  console.log('  -h, --help    display this help message')
  console.log("  -v, --version print npb's version")
  console.log('')
  console.log('Commands:')
  glob.sync('*.js', {cwd: path.join(__dirname, '../commands/')}).forEach(function(filename) {
    console.log('  ' + filename.split('.')[0])
  })
  process.exit(0)
}

var command = args._[0]

try {
  if (/^[a-z]+(?:-[a-z]+)?$/.test(command)) {
    var commandModule = path.join(__dirname, '../commands/' + command + '.js')
    fs.statSync(commandModule)
    try {
      require(commandModule)
    }
    catch (e) {
      process.exit(1)
    }
  }
}
catch (e) {
  // Error thrown by fs.statSync
  console.error('Unknown command: ' + command)
  process.exit(1)
}
