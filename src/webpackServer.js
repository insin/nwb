import assert from 'assert'

import debug from './debug'
import devServer from './devServer'
import getUserConfig from './getUserConfig'
import createWebpackConfig from './createWebpackConfig'

/**
 * Start a development server with webpack using a given build configuration.
 */
export default function(args, buildConfig) {
  // Force environment variable to development
  process.env.NODE_ENV = 'development'

  let userConfig = getUserConfig(args)
  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig()
  }

  let {
    define, entry, output, loaders = {}, plugins, server = {staticPath: null}
  } = buildConfig

  assert(entry, 'an entry file is required to serve a Webpack build')
  assert(output, 'output config is required to serve a Webpack build')

  let webpackConfig = createWebpackConfig(process.cwd(), {
    server: true,
    devtool: 'eval-source-map',
    entry: [
      // Polyfill EventSource for IE, as webpack-hot-middleware/client uses it
      require.resolve('eventsource-polyfill'),
      require.resolve('webpack-hot-middleware/client'),
      entry
    ],
    output,
    loaders,
    plugins: {
      define: {...define, ...userConfig.define},
      ...plugins
    }
  }, userConfig)

  debug('webpack config: %o', webpackConfig)

  devServer(webpackConfig, {
    noInfo: !args.info,
    port: args.port || 3000,
    staticPath: server.staticPath
  })
}
