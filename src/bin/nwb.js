#!/usr/bin/env node

import parseArgs from 'minimist'

import pkg from '../../package.json'

let args = parseArgs(process.argv.slice(2), {
  alias: {
    h: 'help',
    v: 'version'
  },
  boolean: ['help', 'version']
})

if (args.version) {
  console.log(`v${pkg.version}`)
  process.exit(0)
}

if (args.help || args._.length === 0) {
  console.log(`
Usage: nwb <command>

Options:
  -h, --help     display this help message
  -v, --version  print nwb's version

Common commands:

  These will detect which type of project they're being run in.

  build        clean and build
  clean        delete build
  test         start running tests
  test --once  run tests once
  serve        serve with hot reloading

React app commands:

  build-react-app  build app into public/build/
  serve-react-app  serve with hot reloading

Generic app commands:

  build-app  build app into public/build/
  clean-app  delete public/build/

Web module commands:

  build-module  transpile from src/ into lib/
  build-umd     create UMD builds from src/index.js into umd/
  clean-module  delete lib/ and umd/
  dist          clean and build module and demo app (if present)

Web module demo app commands:

  build-demo  build demo app from demo/src/index.js into demo/dist/
  clean-demo  delete demo/dist/
  dist-demo   clean and build demo app
`)
  process.exit(0)
}

let command = args._[0]

let unknownCommand = () => {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}

// Validate the command is in foo-bar-baz format before trying to resolve a
// module path with it.
if (!/^[a-z]+(?:-[a-z]+)*$/.test(command)) {
  unknownCommand()
}

let commandModulePath
try {
  commandModulePath = require.resolve(`../commands/${command}`)
}
catch (e) {
  unknownCommand()
}

try {
  let commandModule = require(commandModulePath)
  if (typeof commandModule == 'function') {
    commandModule(args)
  }
}
catch (e) {
  console.error(`Error running ${command}:`)
  console.error(e.stack)
  process.exit(1)
}
