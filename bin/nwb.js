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
  console.log('  build         lint/clean/build-app if public/ is present, otherwise build-module')
  console.log('  clean         clean-app if public/ is present, otherwise clean-module')
  console.log('  lint          lint src/ and test/')
  console.log('  test          lint and start running unit tests')
  console.log('  test-unit     start running *-test.js unit tests in test/')
  console.log('')
  console.log('Web app commands:')
  console.log('  build-app     build src/index.js into public/build/')
  console.log('  clean-app     delete public/build/')
//  console.log('  serve         serve src/index.js with hot reloading')
  console.log('')
  console.log('Web module commands:')
  console.log('  build-module  transpile from src/ into lib/')
  console.log('  build-umd     create UMD builds from src/index.js into umd/')
  console.log('  clean-module  delete lib/ and umd/')
  console.log('  dist          lint and build module and demo app (if present)')
  console.log('')
  console.log('Web module demo app commands:')
  console.log('  build-demo    build demo app from demo/src/index.js into demo/dist/')
  console.log('  clean-demo    delete demo/dist/')
  console.log('  dist-demo     lint and build demo app')
  console.log('  lint-demo     lint demo/src/')
  process.exit(0)
}

var command = args._[0]

if (/^[a-z]+(?:-[a-z]+)?$/.test(command)) {
  try {
    var commandModule = '../commands/' + command
    require.resolve(commandModule)
    try {
      require(commandModule)
      process.exit(0)
    }
    catch (e) {
      console.error('Error running ' + command + ':')
      console.error(e.stack)
      process.exit(1)
    }
  }
  catch (e) {
    // Error thrown by require.resolve
  }
}

console.error('Unknown command: ' + command)
process.exit(1)
