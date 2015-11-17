#!/usr/bin/env node

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
  console.log('Usage: nwb <command>')
  console.log('')
  console.log('Options:')
  console.log('  -h, --help    display this help message')
  console.log("  -v, --version print nwb's version")
  console.log('')
  console.log('Common commands:')
  console.log('  build         clean and build app if public/ is present, otherwise build module')
  console.log('  clean         clean app if public/ is present, otherwise clean-module')
  console.log('  test          start running *-test.js unit tests in test/')
  console.log('')
  console.log('Web app commands:')
  console.log('  build-app     build src/index.js into public/build/')
  console.log('  clean-app     delete public/build/')
  console.log('')
  console.log('Web module commands:')
  console.log('  build-module  transpile from src/ into lib/')
  console.log('  build-umd     create UMD builds from src/index.js into umd/')
  console.log('  clean-module  delete lib/ and umd/')
  console.log('  dist          clean and build module and demo app (if present)')
  console.log('')
  console.log('Web module demo app commands:')
  console.log('  build-demo    build demo app from demo/src/index.js into demo/dist/')
  console.log('  clean-demo    delete demo/dist/')
  console.log('  dist-demo     clean and build demo app')
  console.log('')
  console.log('React-specific commands:')
  console.log('  build-react-app     build app with Babel production optimisations for React')
  console.log('  serve-react <file>  serve a React entry module with hot reloading')
  console.log('  serve-react-app     serve src/index.js with hot reloading')
  process.exit(0)
}

var command = args._[0]

function unknownCommand() {
  console.error('Unknown command: ' + command)
  process.exit(1)
}

// Validate the command is in foo-bar-baz format before trying to resolve a
// module path with it.
if (!/^[a-z]+(?:-[a-z]+)*$/.test(command)) {
  unknownCommand()
}

var commandModulePath
try {
  commandModulePath = require.resolve('../commands/' + command)
}
catch (e) {
  unknownCommand()
}

try {
  var commandModule = require(commandModulePath)
  if (typeof commandModule == 'function') {
    commandModule(args)
  }
}
catch (e) {
  console.error('Error running ' + command + ':')
  console.error(e.stack)
  process.exit(1)
}
