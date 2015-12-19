import debug from './debug'
import devServer from './devServer'
import createServeReactWebpackConfig from './createServeReactWebpackConfig'

/**
 * Start a development server with Webpack using a given build configuration.
 */
export default function(args, buildConfig, cb) {
  // Force environment variable to development
  process.env.NODE_ENV = 'development'

  let {server = {staticPath: null}} = buildConfig

  let webpackConfig = createServeReactWebpackConfig(args, buildConfig)

  debug('webpack config: %o', webpackConfig)

  devServer(webpackConfig, {
    fallback: !!args.fallback,
    noInfo: !args.info,
    port: args.port || 3000,
    staticPath: server.staticPath
  }, cb)
}
