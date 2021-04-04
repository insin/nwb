// @flow
import assert from 'assert'

import webpack from 'webpack'

import {createServeConfig} from './appCommands'
import {getProjectType} from './config'
import {INFERNO_APP, PREACT_APP, REACT_APP, WEB_APP} from './constants'
import createServerWebpackConfig from './createServerWebpackConfig'
import debug from './debug'
import {deepToString, joinAnd} from './utils'

const APP_TYPE_CONFIG = {
  [INFERNO_APP]: './inferno',
  [PREACT_APP]: './preact',
  [REACT_APP]: './react',
  [WEB_APP]: './web',
}

/**
 * Express middleware for serving an app with hot reloading - equivalent to
 * having run `nwb serve`, but from your own server.
 */
export default function nwbMiddleware(express: Object, options: Object = {}) {
  assert(
    express && typeof express.Router === 'function',
    'The express module must be passed as the first argument to nwb middleware'
  )

  let projectType = options.type
  if (projectType == null) {
    projectType = getProjectType({_: ['serve'], config: options.config})
  }
  if (!APP_TYPE_CONFIG[projectType]) {
    throw new Error(
      `nwb Express middleware is unable to handle '${projectType}' projects, only ` +
      joinAnd(Object.keys(APP_TYPE_CONFIG).map(s => `'${s}'`), 'or')
    )
  }

  // Use options to create an object equivalent to CLI args parsed by minimist
  let args = {
    _: [`serve-${projectType}`, options.entry],
    config: options.config,
    hmr: options.hmr !== false,
    install: !!options.install || !!options.autoInstall,
    reload: !!options.reload
  }

  let appTypeConfig = require(APP_TYPE_CONFIG[projectType])(args)

  let webpackConfig = createServerWebpackConfig(
    args,
    createServeConfig(args, appTypeConfig.getServeConfig(), {
      stats: 'none',
      plugins: {
        status: {
          disableClearConsole: true,
          successMessage: null,
        }
      }
    })
  )

  debug('webpack config: %s', deepToString(webpackConfig))

  let compiler = webpack(webpackConfig)

  let router = express.Router()

  router.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }))

  router.use(require('webpack-hot-middleware')(compiler, {
    log: false
  }))

  return router
}
