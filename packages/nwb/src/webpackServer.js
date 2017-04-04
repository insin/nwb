import {yellow} from 'chalk'
import detect from 'detect-port'
import inquirer from 'inquirer'

import {DEFAULT_PORT} from './constants'
import createServerWebpackConfig from './createServerWebpackConfig'
import debug from './debug'
import devServer from './devServer'
import {clearConsole, deepToString} from './utils'

/**
 * Get the host and port to run the server on, detecting if the intended port
 * is available first and prompting the user if not.
 */
function getServerOptions(args, cb) {
  // Fallback index serving is enabled by default and must be explicitly enabled
  let fallback = args.fallback !== false
  // The dev server handles defaulting the host by not providing it at all
  let host = args.host
  let intendedPort = args.port || DEFAULT_PORT

  detect(intendedPort, (err, suggestedPort) => {
    if (err) return cb(err)
    if (suggestedPort === intendedPort) return cb(null, {fallback, host, port: intendedPort})
    if (args.force) return cb(null, {fallback, host, port: suggestedPort})

    clearConsole()
    console.log(yellow(`Something is already running on port ${intendedPort}.`))
    console.log()
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'run',
        message: 'Would you like to run the app on another port instead?',
        default: true,
      },
    ]).then(
      ({run}) => cb(null, run ? {fallback, host, port: suggestedPort} : null),
      (err) => cb(err)
    )
  })
}

/**
 * Start a development server with Webpack using a given build configuration.
 */
export default function webpackServer(args, buildConfig, cb) {
  // Default environment to development - we also run the dev server while
  // testing to check that HMR works.
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
  }

  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig(args)
  }

  // Other config can be provided by the user via the CLI
  getServerOptions(args, (err, options) => {
    if (err) return cb(err)
    if (options === null) return cb()

    if (!('status' in buildConfig.plugins)) {
      buildConfig.plugins.status = {
        message: `The app is running at http://${options.host || 'localhost'}:${options.port}/`,
      }
    }

    let webpackConfig
    try {
      webpackConfig = createServerWebpackConfig(args, buildConfig)
    }
    catch (e) {
      return cb(e)
    }

    debug('webpack config: %s', deepToString(webpackConfig))

    devServer(webpackConfig, options, cb)
  })
}
