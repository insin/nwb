import {cyan as opt, green as cmd, red, yellow as req} from 'chalk'
import parseArgs from 'minimist'

import pkg from '../package.json'
import {CONFIG_FILE_NAME} from './constants'

export default function cli(argv, cb) {
  let args = parseArgs(argv, {
    alias: {
      c: 'config',
      h: 'help',
      v: 'version',
    },
    boolean: ['help', 'version'],
  })

  let command = args._[0]

  if (args.version || /^v(ersion)?$/.test(command)) {
    console.log(`v${pkg.version}`)
    process.exit(0)
  }

  if (args.help || !command || /^h(elp)?$/.test(command)) {
    console.log(`Usage: ${cmd('nwb')} ${req('<command>')} ${opt('[options]')}

Options:
  ${opt('-c, --config')}   config file to use ${opt(`[default: ${CONFIG_FILE_NAME}]`)}
  ${opt('-h, --help')}     display this help message
  ${opt('-v, --version')}  print nwb's version

Project creation commands:
  ${cmd('nwb new')} ${req('<project_type> <name>')} ${opt('[options]')}
    Create a project in a new directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${req('name')}          project name

  ${cmd('nwb init')} ${req('<project_type>')} ${opt('[name] [options]')}
    Initialise a project in the current directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${opt('name')}          project name ${opt('[default: working directory name]')}

  Options:
    ${opt('-f, --force')}           force project creation, don't ask questions
    ${opt('-n, --native-modules')}  enable an extra build with native ES6 modules
    ${opt('--react')}               version of React to install for React apps & components
    ${opt('--umd=<var>')}           enable a UMD build which exports the given global variable

  Project types:
    ${req('react-app')}        a React app
    ${req('react-component')}  a React component module with a demo app
    ${req('web-app')}          a plain JavaScript app
    ${req('web-module')}       a plain JavaScript module

Generic development commands:
  Arguments for these commands depend on the type of project they're being run
  in. See the applicable project type-specific commands below.

  ${cmd('nwb build')}
    Clean and build the project.

  ${cmd('nwb clean')}
    Delete built resources.

  ${cmd('nwb serve')}
    Serve an app, or a component's demo app, with hot reloading.

    Options:
      ${opt('--auto-install')}  auto install missing npm dependencies
      ${opt('--fallback')}      serve the index page from any path
      ${opt('--host')}          hostname to bind the dev server to
      ${opt('--port')}          port to run the dev server on ${opt('[default: 3000]')}
      ${opt('--reload')}        auto reload the page if hot reloading fails

  ${cmd('nwb test')}
    Run unit tests.

    Options:
      ${opt('--coverage')}  create a code coverage report
      ${opt('--server')}    keep running tests on every change

Project type-specific commands:
  ${cmd('nwb build-demo')}
    Build a demo app from demo/src/index.js to demo/dist/.

  ${cmd('nwb build-module')}
    Create an ES5 build for an npm module (ES6 modules build requires config).

  ${cmd('nwb build-react-app')} ${opt('[entry] [dist_dir]')}
    Build a React app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb build-umd')} ${opt('[entry]')}
    Create a UMD build for an npm module from ${opt('entry')} (requires config).

  ${cmd('nwb build-web-app')} ${opt('[entry] [dist_dir]')}
    Build a web app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb clean-app')} ${opt('[dist_dir]')}
    Delete ${opt('dist_dir')}.

  ${cmd('nwb clean-demo')}
    Delete demo/dist/.

  ${cmd('nwb clean-module')}
    Delete coverage/, es6/ and lib/.

  ${cmd('nwb clean-umd')}
    Delete umd/.

  ${cmd('nwb serve-react-app')} ${opt('[entry]')}
    Serve a React app from ${opt('entry')}

  ${cmd('nwb serve-react-demo')}
    Serve a React demo app from demo/src/index.js.

  ${cmd('nwb serve-web-app')} ${opt('[entry]')}
    Serve a web app from ${opt('entry')}.

  Arguments:
    ${opt('entry')}     entry point ${opt('[default: src/index.js]')}
    ${opt('dist_dir')}  build output directory ${opt('[default: dist/]')}

Helper commands:
  ${cmd('nwb check-config')} ${opt('[config]')} ${opt('[options]')}
    Check your configuration file for errors, deprecated config and usage hints

    Arguments:
      ${opt('config')}     path to the file to validate ${opt(`[default: ${CONFIG_FILE_NAME}]`)})

    Options:
      ${opt('--command')}  nwb command name to use when checking your config
      ${opt('-e, --env')}  NODE_ENV to use when checking your config: dev, test or prod
`)
    process.exit(args.help || command ? 0 : 1)
  }

  let unknownCommand = () => {
    console.error(`${red('Unknown command:')} ${req(command)}`)
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
  commandModule(args, cb)
}
