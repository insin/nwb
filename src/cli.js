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
    console.log(`Usage: ${green('nwb')} ${yellow('<command>')}

Options:
  ${cyan('-h, --help')}     display this help message
  ${cyan('-v, --version')}  print nwb's version

Project creation commands:
  ${green('init')} ${yellow('<project-type>')} ${cyan('[name]')}
    initialise a project in the current directory

  ${green('new')} ${yellow('<project-type> <name>')}
    create a project in a new directory

  ${cyan('-f, --force')}   force project creation, don't ask questions
  ${cyan('-g, --global')}  global variable name to export in the UMD build
  ${cyan('--no-jsnext')}   disable npm ES6 modules build
  ${cyan('--no-umd')}      disable npm UMD module build

  Project types:
    ${cyan('react-app')}        a React app
    ${cyan('react-component')}  a React component module with a demo app
    ${cyan('web-app')}          a plain JavaScript app
    ${cyan('web-module')}       a plain JavaScript module

Generic development commands:
  ${green('build')}
    clean and build the project

  ${green('clean')}
    delete built resources

  ${green('serve')}
    serve an app, or a component's demo app, with hot reloading
    ${cyan('--auto-install')}  auto install missing npm dependencies
    ${cyan('--fallback')}      serve the index page from any path
    ${cyan('--info')}          show webpack module info
    ${cyan('--port')}          port to run the dev server on ${cyan('(default: 3000)')}
    ${cyan('--reload')}        auto reload the page if hot reloading fails

  ${green('test')}
    run unit tests
    ${cyan('--coverage')}  create a code coverage report
    ${cyan('--server')}    keep running tests on every change

Project type-specific commands:
  ${green('build-demo')}
    build a demo app from demo/src/index.js to demo/dist/
  ${green('build-module')}
    create an ES5 build for an npm module (ES6 modules build requires config)
  ${green('build-react-app')}
    build a react app from src/index.js to dist/
  ${green('build-umd')}
    create a UMD build for an npm module (requires config)
  ${green('build-web-app')}
    build a web app from src/index.js to dist/
  ${green('clean-app')}
    delete dist/
  ${green('clean-demo')}
    delete demo/dist/
  ${green('clean-module')}
     delete coverage/, es6/ and lib/
  ${green('clean-umd')}
    delete umd/
  ${green('serve-react-app')}
    serve a React app from src/index.js
  ${green('serve-react-demo')}
    serve a React demo app from demo/src/index.js
  ${green('serve-web-app')}
    serve a web app from src/index.js
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
