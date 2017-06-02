import assert from 'assert'

import webpack from 'webpack'

import {INFERNO_APP, PREACT_APP, REACT_APP, WEB_APP} from './constants'
import createServerWebpackConfig from './createServerWebpackConfig'
import debug from './debug'
import {getProjectType} from './getUserConfig'
import {deepToString, joinAnd} from './utils'

const SERVE_APP_CONFIG = {
  [INFERNO_APP]: './createServeInfernoAppConfig',
  [PREACT_APP]: './createServePreactAppConfig',
  [REACT_APP]: './createServeReactAppConfig',
  [WEB_APP]: './createServeWebAppConfig',
}

/**
 * Express middleware for serving an app with hot reloading - equivalent to
 * having run `nwb serve`, but from your own server.
 */
export default function nwbMiddleware(express, options = {}) {
  assert(
    express && typeof express.Router === 'function',
    'The express module must be passed as the first argument to nwb middleware'
  )

  let projectType = options.type
  if (projectType == null) {
    projectType = getProjectType({_: ['serve'], config: options.config})
  }
  if (!SERVE_APP_CONFIG[projectType]) {
    throw new Error(
      `nwb Express middleware is unable to handle '${projectType}' projects, only ` +
      joinAnd(Object.keys(SERVE_APP_CONFIG).map(s => `'${s}'`), 'or')
    )
  }

  let createServeAppConfig = require(SERVE_APP_CONFIG[projectType])

  // Use options to create an object equivalent to CLI args parsed by minimist
  let args = {
    _: [`serve-${projectType}`, options.entry],
    config: options.config,
    hmre: !options.hmr || !options.hmre,
    install: !!options.install || !!options.autoInstall,
    reload: !!options.reload
  }

  let webpackConfig = createServerWebpackConfig(
    args,
    createServeAppConfig(args, {
      plugins: {
        status: {
          middleware: true
        }
      }
    })
  )

  debug('webpack config: %s', deepToString(webpackConfig))

  let compiler = webpack(webpackConfig)

  let router = express.Router()

  router.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/
    }
  }))

  router.use(require('webpack-hot-middleware')(compiler, {
    log: false
  }))

  return router
}
