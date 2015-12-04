var assert = require('assert')

var webpack = require('webpack')

var createServeReactAppConfig = require('./lib/createServeReactAppConfig')
var createServeReactAppBuildConfig = require('./lib/createServeReactAppBuildConfig')
var createServeReactWebpackConfig = require('./lib/createServeReactWebpackConfig')
var debug = require('./lib/debug')

/**
 * Express middleware for serving a React app with hot reloading - equivalent to
 * having run `nwb serve`, but from your own server.
 */
module.exports = function(express, options) {
  assert(express, 'The express module must be passed as the first argument to nwb middleware')

  if (!options) options = {}
  if (!('info' in options)) options.info = false

  var webpackConfig = createServeReactWebpackConfig(
    options,
    createServeReactAppBuildConfig(
      createServeReactAppConfig()
    )
  )

  debug('webpack config: %o', webpackConfig)

  var compiler = webpack(webpackConfig)

  var router = express.Router()

  router.use(require('webpack-dev-middleware')(compiler, {
    noInfo: !options.info,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }))

  router.use(require('webpack-hot-middleware')(compiler))

  return router
}
