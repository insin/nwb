import {cyan as opt, green as cmd, red, yellow as req} from 'chalk'
import parseArgs from 'minimist'

import pkg from '../package.json'

export default function(argv, cb) {
  let args = parseArgs(argv, {
    alias: {
      c: 'config',
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
    console.log(`Usage: ${cmd('nwb')} ${req('<command>')}

Options:
  ${opt('-c, --config')}   config file to use ${opt('[default: nwb.config.js]')}
  ${opt('-h, --help')}     display this help message
  ${opt('-v, --version')}  print nwb's version

Project creation commands:
  ${cmd('init')} ${req('<project_type>')} ${opt('[name] [options]')}
    Initialise a project in the current directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${opt('name')}          project name ${opt('[default: working directory name]')}

  ${cmd('new')} ${req('<project_type> <name>')} ${opt('[options]')}
    Create a project in a new directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${req('name')}          project name

  Options:
    ${opt('-f, --force')}   force project creation, don't ask questions
    ${opt('-g, --global')}  global variable name to export in the UMD build
    ${opt('--no-jsnext')}   disable npm ES6 modules build
    ${opt('--no-umd')}      disable npm UMD module build
    ${opt('--react')}       version of React to install for React apps & components

  Project types:
    ${req('react-app')}        a React app
    ${req('react-component')}  a React component module with a demo app
    ${req('web-app')}          a plain JavaScript app
    ${req('web-module')}       a plain JavaScript module

Generic development commands:
  Arguments for these commands depend on the type of project they're being run
  in. See the applicable project-type-specific commands below.

  ${cmd('build')}
    Clean and build the project.

  ${cmd('clean')}
    Delete built resources.

  ${cmd('serve')}
    Serve an app, or a component's demo app, with hot reloading.

    Options:
      ${opt('--auto-install')}  auto install missing npm dependencies
      ${opt('--fallback')}      serve the index page from any path
      ${opt('--host')}          hostname to bind the dev server to ${opt('[default: localhost]')}
      ${opt('--info')}          show webpack module info
      ${opt('--port')}          port to run the dev server on ${opt('[default: 3000]')}
      ${opt('--reload')}        auto reload the page if hot reloading fails

  ${cmd('test')}
    Run unit tests.

    Options:
      ${opt('--coverage')}  create a code coverage report
      ${opt('--server')}    keep running tests on every change

Project-type-specific commands:
  ${cmd('build-demo')}
    Build a demo app from demo/src/index.js to demo/dist/.

  ${cmd('build-module')}
    Create an ES5 build for an npm module (ES6 modules build requires config).

  ${cmd('build-react-app')} ${opt('[entry] [dist_dir]')}
    Build a React app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('build-umd')} ${opt('[entry]')}
    Create a UMD build for an npm module from ${opt('entry')} (requires config).

  ${cmd('build-web-app')} ${opt('[entry] [dist_dir]')}
    Build a web app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('clean-app')} ${opt('[dist_dir]')}
    Delete ${opt('dist_dir')}.

  ${cmd('clean-demo')}
    Delete demo/dist/.

  ${cmd('clean-module')}
    Delete coverage/, es6/ and lib/.

  ${cmd('clean-umd')}
    Delete umd/.

  ${cmd('serve-react-app')} ${opt('[entry]')}
    Serve a React app from ${opt('entry')}

  ${cmd('serve-react-demo')}
    Serve a React demo app from demo/src/index.js.

  ${cmd('serve-web-app')} ${opt('[entry]')}
    Serve a web app from ${opt('entry')}.

  Arguments:
    ${opt('entry')}     entry point ${opt('[default: src/index.js]')}
    ${opt('dist_dir')}  build output directory ${opt('[default: dist/]')}
`)
    process.exit(args.help || command ? 0 : 1)
  }

  let unknownCommand = () => {
    console.error(`${red('nwb: unknown command:')} ${req(command)}`)
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
