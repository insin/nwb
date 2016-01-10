var assert = require('assert')

var webpack = require('webpack')

var createServeReactAppConfig = require('./lib/createServeReactAppConfig')
var createServeReactAppBuildConfig = require('./lib/createServeReactAppBuildConfig')
var createServerWebpackConfig = require('./lib/createServerWebpackConfig')
var debug = require('./lib/debug')

/**
 * Express middleware for serving a React app with hot reloading - equivalent to
 * having run `nwb serve`, but from your own server.
 */
module.exports = function(express, options) {
  assert(
    express && typeof express.Router === 'function',
    'The express module must be passed as the first argument to nwb middleware'
  )

  if (!options) options = {}

  // Use options to create an object equivalent to CLI args parsed by minimist
  var args = {}
  args.info = !!options.info
  args['auto-install'] = !!options.autoInstall

  var webpackConfig = createServerWebpackConfig(
    args,
    createServeReactAppBuildConfig(
      createServeReactAppConfig()
    )
  )

  debug('webpack config: %o', webpackConfig)

  var compiler = webpack(webpackConfig)

  var router = express.Router()

  router.use(require('webpack-dev-middleware')(compiler, {
    noInfo: !args.info,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }))

  router.use(require('webpack-hot-middleware')(compiler))

  return router
}
