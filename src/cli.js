import {cyan, green, red, yellow} from 'chalk'
import parseArgs from 'minimist'

import pkg from '../package.json'

export default function(argv, cb) {
  let args = parseArgs(argv, {
    alias: {
      h: 'help',
      v: 'version'
    },
    boolean: ['help', 'version']
  })

  let command = args._[0]

  if (args.version || /^v(ersion)?$/.test(command)) {
    console.log(`v${pkg.version}`)
    process.exit(0)
  }

  if (args.help || !command || /^h(elp)?$/.test(command)) {
    console.log(`Usage:
  ${green('nwb')} ${yellow('<command>')} ${cyan('[options]')}

Options:
  ${cyan('-h, --help')}     display this help message
  ${cyan('-v, --version')}  print nwb's version

Project creation commands:
  ${green('init')} ${yellow('<project_type>')} ${cyan('[name]')}
    initialise a project in the current directory

  ${green('new')} ${yellow('<project_type> <name>')}
    create a project in a new directory

  Positional arguments:
    ${cyan('project_type')}  project type - see the list below
    ${cyan('name')}          project name ${cyan('[default: current directory name]')}

  Options:
    ${cyan('-f, --force')}   force project creation, don't ask questions
    ${cyan('-g, --global')}  global variable name to export in the UMD build
    ${cyan('--no-jsnext')}   disable npm ES6 modules build
    ${cyan('--no-umd')}      disable npm UMD module build
    ${cyan('--react')}       version of React to install for React apps & components

  Project types:
    ${cyan('react-app')}        a React app
    ${cyan('react-component')}  a React component module with a demo app
    ${cyan('web-app')}          a plain JavaScript app
    ${cyan('web-module')}       a plain JavaScript module

Generic development commands:
  Positional arguments for these commands depend on the type of project they're
  being run in. See the applicable project-type-specific commands below.

  ${green('build')}
    clean and build the project

  ${green('clean')}
    delete built resources

  ${green('serve')}
    serve an app, or a component's demo app, with hot reloading

    Options:
      ${cyan('--auto-install')}  auto install missing npm dependencies
      ${cyan('--fallback')}      serve the index page from any path
      ${cyan('--host')}          hostname to bind the dev server to ${cyan('[default: localhost]')}
      ${cyan('--info')}          show webpack module info
      ${cyan('--port')}          port to run the dev server on ${cyan('[default: 3000]')}
      ${cyan('--reload')}        auto reload the page if hot reloading fails

  ${green('test')}
    run unit tests

    Options:
      ${cyan('--coverage')}  create a code coverage report
      ${cyan('--server')}    keep running tests on every change

Project-type-specific commands:
  ${green('build-demo')}
    build a demo app from demo/src/index.js to demo/dist/

  ${green('build-module')}
    create an ES5 build for an npm module (ES6 modules build requires config)

  ${green('build-react-app')} ${cyan('[entry] [dist_dir]')}
    build a React app from ${cyan('entry')} to ${cyan('dist_dir')}

  ${green('build-umd')} ${cyan('[entry]')}
    create a UMD build for an npm module from ${cyan('entry')} (requires config)

  ${green('build-web-app')} ${cyan('[entry] [dist_dir]')}
    build a web app from ${cyan('entry')} to ${cyan('dist_dir')}

  ${green('clean-app')} ${cyan('[dist_dir]')}
    delete ${cyan('dist_dir')}

  ${green('clean-demo')}
    delete demo/dist/

  ${green('clean-module')}
    delete coverage/, es6/ and lib/

  ${green('clean-umd')}
    delete umd/

  ${green('serve-react-app')} ${cyan('[entry]')}
    serve a React app from ${cyan('entry')}

  ${green('serve-react-demo')}
    serve a React demo app from demo/src/index.js

  ${green('serve-web-app')} ${cyan('[entry]')}
    serve a web app from ${cyan('entry')}

  Positional arguments:
    ${cyan('entry')}     entry point ${cyan('[default: src/index.js]')}
    ${cyan('dist_dir')}  build output directory ${cyan('[default: dist/]')}
`)
    process.exit(args.help || command ? 0 : 1)
  }

  let unknownCommand = () => {
    console.error(`${red('nwb: unknown command:')} ${yellow(command)}`)
    process.exit(1)
  }

  // Validate the command is in foo-bar-baz format before trying to resolve a
  // module path with it.
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(command)) {
    unknownCommand()
  }

  let commandModulePath
  try {
    commandModulePath = require.resolve(`./commands/${command}`)
  }
  catch (e) {
    unknownCommand()
  }

  let commandModule = require(commandModulePath)
  if (commandModule.default) {
    commandModule = commandModule.default
  }
  commandModule(args, cb)
}
