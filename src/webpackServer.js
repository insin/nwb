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
  let fallback = !!args.fallback
  // The dev server handles defaulting the host by not providing it at all
  let host = args.host
  let intendedPort = args.port || DEFAULT_PORT

  detect(intendedPort, (err, suggestedPort) => {
    if (err) return cb(err)
    if (suggestedPort === intendedPort) return cb(null, {fallback, host, port: intendedPort})
    if (args.force) return cb(null, {fallback, host, port: suggestedPort})

    clearConsole()
    console.log(yellow(`Something is already running at port ${intendedPort}.`))
    console.log()
    inquirer.prompt([
      {
        type: 'confirm',
        name: 'run',
        message: 'Would you like to run the app at another port instead?',
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

  // Other config can be provided by the user via the CLI
  getServerOptions(args, (err, serverOptions) => {
    if (err) return cb(err)
    if (serverOptions === null) return cb()

    let webpackConfig = createServerWebpackConfig(args, {
      ...buildConfig,
      server: serverOptions,
    })

    debug('webpack config: %s', deepToString(webpackConfig))

    devServer(webpackConfig, serverOptions, cb)
  })
}
