#!/usr/bin/env node

import {cyan as opt, green as cmd, red, yellow as req} from 'chalk'
import parseArgs from 'minimist'

import pkg from '../../package.json'
import {CONFIG_FILE_NAME} from '../constants'
import {ConfigValidationError, UserError} from '../errors'

const COMMAND_MODULES = {
  build: 'build-react',
  run: 'serve-react',
}

function handleError(error) {
  if (error instanceof UserError) {
    console.error(red(error.message))
  }
  else if (error instanceof ConfigValidationError) {
    error.report.log()
  }
  else {
    console.error(red(`Error running command: ${error.message}`))
    if (error.stack) {
      console.error(error.stack)
    }
  }
  process.exit(1)
}

let args = parseArgs(process.argv.slice(2), {
  alias: {
    c: 'config',
    h: 'help',
    p: 'plugins',
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
  console.log(`Usage: ${cmd('react')} ${req('(run|build)')} ${opt('[options]')}

Options:
  ${opt('-c, --config')}   config file to use ${opt(`[default: ${CONFIG_FILE_NAME}]`)}
  ${opt('-h, --help')}     display this help message
  ${opt('-p, --plugins')}  a comma-separated list of nwb plugins to use
  ${opt('-v, --version')}  print nwb's version

Commands:
  ${cmd('react run')} ${req('<entry>')} ${opt('[options]')}
    Serve a React app or component module.

    Arguments:
      ${req('entry')}          entry point for the app, or a component module

    Options:
      ${opt('--force')}        don't shim rendering, use the given entry module directly
      ${opt('--install')}      automatically install missing npm dependencies
      ${opt('--host')}         hostname to bind the dev server to
      ${opt('--mount-id')}     id for the <div> the app will render into ${opt('[default: app]')}
      ${opt('--no-fallback')}  disable serving of the index page from any path
      ${opt('--no-polyfill')}  disable inclusion of default polyfills
      ${opt('--port')}         port to run the dev server on ${opt('[default: 3000]')}
      ${opt('--reload')}       auto reload the page if hot reloading fails
      ${opt('--title')}        contents for <title> ${opt('[default: React App]')}

  ${cmd('react build')} ${req('<entry>')} ${opt('[dist_dir] [options]')}
    Create a static build for a React app.

    Arguments:
      ${req('entry')}       entry point for the app
      ${opt('dist_dir')}    build output directory ${opt('[default: dist/]')}

    Options:
      ${opt('--force')}        don't shim rendering, use the given entry module directly
      ${opt('--mount-id')}     id for the <div> the app will render into ${opt('[default: app]')}
      ${opt('--no-polyfill')}  disable bundling of default polyfills
      ${opt('--title')}        contents for <title> ${opt('[default: React App]')}
      ${opt('--vendor')}       create a 'vendor' bundle for node_modules/ modules

    React-compatible builds using other libraries:
      ${opt('--inferno[-compat]')}   create an Inferno compatibility build
      ${opt('--preact[-compat]')}    create a Preact compatibility build
`)
  process.exit(args.help || command ? 0 : 1)
}

if (!COMMAND_MODULES.hasOwnProperty(command)) {
  console.error(`${red('Unknown command:')} ${req(command)}`)
  process.exit(1)
}

let commandModule = require(`../commands/${COMMAND_MODULES[command]}`)

try {
  commandModule(args, err => {
    if (err) handleError(err)
  })
}
catch (e) {
  handleError(e)
}
