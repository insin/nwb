// @flow
import path from 'path'

import {cyan as opt, green as cmd, red, yellow as req} from 'chalk'
import parseArgs from 'minimist'
import semver from 'semver'

import {CONFIG_FILE_NAME} from './constants'
import {UserError} from './errors'
import {modulePath} from './utils'

import type {ErrBack} from './types'

export default function cli(argv: string[], cb: ErrBack) {
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
    let pkg = require('../package.json')
    console.log(`v${pkg.version}`)
    process.exit(0)
  }

  if (args.help || !command || /^h(elp)?$/.test(command)) {
    console.log(`Usage: ${cmd('nwb')} ${req('<command>')} ${opt('[options]')}

Options:
  ${opt('-c, --config')}   config file to use ${opt(`[default: ${CONFIG_FILE_NAME}]`)}
  ${opt('-h, --help')}     display this help message
  ${opt('-v, --version')}  print nwb's version

Quick development commands:
  ${cmd('nwb inferno')} ${req('(run|build) <entry>')}  run or build an Inferno app
  ${cmd('nwb preact')} ${req('(run|build) <entry>')}   run or build a Preact app
  ${cmd('nwb react')} ${req('(run|build) <entry>')}    run or build a React app
  ${cmd('nwb web')} ${req('(run|build) <entry>')}      run or build a vanilla JavaScript app

  Run ${cmd('nwb (inferno|preact|react|web) help')} for options.

Project creation commands:
  ${cmd('nwb new')} ${req('<project_type> <dir_name>')} ${opt('[options]')}
    Create a project in a new directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${req('dir_name')}      project name / directory to create the project in

  ${cmd('nwb init')} ${req('<project_type>')} ${opt('[dir_name] [options]')}
    Initialise a project in the current directory.

    Arguments:
      ${req('project_type')}  project type - see the list below
      ${opt('dir_name')}      project name ${opt('[default: current directory name]')}

  Options:
    ${opt('-f, --force')}   force project creation, don't ask questions
    ${opt('--es-modules')}  enable or disable (${opt('--no-es-modules')}) an ES modules build
    ${opt('--no-git')}      disable creation of a Git repo with an initial commit
    ${opt('--react')}       version of React to install for React apps & components
    ${opt('--umd=<var>')}   enable or disable (${opt('--no-umd')}) a UMD build

  Project types:
    ${req('react-app')}        a React app
    ${req('react-component')}  a React component or library npm module
    ${req('preact-app')}       a Preact app
    ${req('inferno-app')}      an Inferno app
    ${req('web-app')}          a plain JavaScript app
    ${req('web-module')}       a plain JavaScript npm module

Generic project development commands:
  Arguments for these commands depend on the type of project they're being run
  in. See the applicable project type-specific commands below.

  ${cmd('nwb build')}
    Clean and build the project.

    Options:
      ${opt('--no-html')}    disable creation of an index.html if you don't need it
      ${opt('--no-vendor')}  disable creation of 'vendor' bundle for node_modules/ modules

  ${cmd('nwb clean')}
    Delete built resources.

  ${cmd('nwb serve')}
    Serve an app, or a component's demo app, with hot reloading.

    Options:
      ${opt('--install')}      automatically install missing npm dependencies
      ${opt('--host')}         hostname to bind the dev server to
      ${opt('--no-clear')}     don't clear the console when displaying build status
      ${opt('--no-fallback')}  disable serving of the index page from any path
      ${opt('--port')}         port to run the dev server on ${opt('[default: 3000]')}
      ${opt('--reload')}       auto reload the page if hot reloading fails

  ${cmd('nwb test')}
    Run tests.

    Options:
      ${opt('--coverage')}  create a code coverage report
      ${opt('--server')}    keep running tests on every change

Project type-specific commands:
  ${cmd('nwb build-demo')}
    Build a demo app from demo/src/index.js to demo/dist/.

  ${cmd('nwb build-react-app')} ${opt('[entry] [dist_dir]')}
    Build a React app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb build-react-component')} ${opt('[umd_entry]')}
    Create ES5, ES modules and UMD builds for a React component.

    Options:
      ${opt('--copy-files')}        copy files which won't be transpiled by Babel (e.g. CSS)
      ${opt('--no-demo')}           don't build the demo app, if there is one
      ${opt('--[keep-]proptypes')}  keep component propTypes in production builds

  ${cmd('nwb build-preact-app')} ${opt('[entry] [dist_dir]')}
    Build a Preact app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb build-inferno-app')} ${opt('[entry] [dist_dir]')}
    Build an Inferno app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb build-web-app')} ${opt('[entry] [dist_dir]')}
    Build a web app from ${opt('entry')} to ${opt('dist_dir')}.

  ${cmd('nwb build-web-module')} ${opt('[umd_entry]')}
    Create ES5, ES modules and UMD builds for a web module.

  ${cmd('nwb clean-app')} ${opt('[dist_dir]')}
    Delete ${opt('dist_dir')}.

  ${cmd('nwb clean-demo')}
    Delete demo/dist/.

  ${cmd('nwb clean-module')}
    Delete coverage/, es/, lib/ and umd/.

  ${cmd('nwb serve-react-app')} ${opt('[entry]')}
    Serve a React app from ${opt('entry')}

    Options:
      ${opt('--no-hmr')}  disable use of Fast Refresh for Hot Module Replacement

  ${cmd('nwb serve-react-demo')}
    Serve a React demo app from demo/src/index.js.

    Options:
      ${opt('--no-hmr')}  disable use of Fast Refresh for Hot Module Replacement

  ${cmd('nwb serve-preact-app')} ${opt('[entry]')}
    Serve a Preact app from ${opt('entry')}

  ${cmd('nwb serve-inferno-app')} ${opt('[entry]')}
    Serve an Inferno app from ${opt('entry')}

  ${cmd('nwb serve-web-app')} ${opt('[entry]')}
    Serve a web app from ${opt('entry')}.

  ${cmd('nwb test-react')}
    Tests a React project.

  ${cmd('nwb test-preact')}
    Tests a Preact project.

  ${cmd('nwb test-inferno')}
    Tests an Inferno project.

  Arguments:
    ${opt('entry')}      entry point ${opt('[default: src/index.js]')}
    ${opt('dist_dir')}   build output directory ${opt('[default: dist/]')}
    ${opt('umd_entry')}  entry point for UMD builds ${opt('[default: src/index.js]')}

Helper commands:
  ${cmd('nwb check-config')} ${opt('[config]')} ${opt('[options]')}
    Check your configuration file for errors, deprecated config and usage hints.

    Arguments:
      ${opt('config')}     path to the file to validate ${opt(`[default: ${CONFIG_FILE_NAME}]`)}

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
    return unknownCommand()
  }

  let commandModulePath
  try {
    commandModulePath = require.resolve(`./commands/${command}`)
  }
  catch (e) {
    // XXX Flow complains that commandModulePath might be uninitialised if we
    //     return from here.
  }
  if (commandModulePath == null) {
    return unknownCommand()
  }

  // Check if the user is running a version of nwb from outside their project
  // which doesn't satisfy what's specified in package.json (when available).
  if (/^(build|check|clean|serve|test)/.test(command)) {
    let localNwbPath = null
    try {
      localNwbPath = modulePath('nwb')
    }
    catch (e) {
      // nwb isn't installed locally to where the command is being run
    }

    let runningNwbPath = path.dirname(require.resolve('../package'))

    if (localNwbPath !== runningNwbPath) {
      let pkg = null
      try {
        pkg = require(path.resolve('package.json'))
      }
      catch (e) {
        // pass
      }
      let requiredNwbVersion = pkg && (
        (pkg.devDependencies && pkg.devDependencies.nwb) ||
        (pkg.dependencies && pkg.dependencies.nwb)
      )
      if (requiredNwbVersion) {
        let runningNwbVersion = require('../package').version
        if (!semver.satisfies(runningNwbVersion, requiredNwbVersion)) {
          return cb(new UserError(
            `The version of nwb you're running (v${runningNwbVersion}, from ${runningNwbPath}) ` +
            `doesn't satisfy the version specified in ${path.resolve('package.json')} (${requiredNwbVersion}).`
          ))
        }
      }
    }
  }

  let commandModule = require(commandModulePath)
  // Quick commands handle running themselves
  if (typeof commandModule === 'function') {
    commandModule(args, cb)
  }
}
