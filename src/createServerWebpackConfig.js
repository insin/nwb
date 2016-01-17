import assert from 'assert'

import createWebpackConfig from './createWebpackConfig'
import debug from './debug'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'

/**
 * Creates the final Webpack config for serving a web app with hot reloading,
 * using build and user configuration.
 */
export default function(args, buildConfig) {
  let userConfig = getUserConfig(args)
  let pluginConfig = getPluginConfig()

  let {
    define, entry, output, loaders = {}, plugins
  } = buildConfig

  assert(entry, 'an entry file is required to serve a Webpack build')
  assert(output, 'output config is required to serve a Webpack build')

  let hotMiddlewareOptions = args.reload ? '?reload=true' : ''

  let postLoaders = []
  if (args['auto-install']) {
    debug('configuring auto-install')
    postLoaders.push({
      id: 'install',
      test: /\.js$/,
      loader: require.resolve('npm-install-loader'),
      query: {
        cli: {
          save: true
        }
      },
      exclude: /node_modules/
    })
  }

  return createWebpackConfig({
    server: true,
    devtool: '#eval-source-map',
    entry: [
      // Polyfill EventSource for IE, as webpack-hot-middleware/client uses it
      require.resolve('eventsource-polyfill'),
      require.resolve('webpack-hot-middleware/client') + hotMiddlewareOptions,
      entry
    ],
    output,
    loaders,
    postLoaders,
    plugins: {
      define: {...define, ...userConfig.define},
      ...plugins
    }
  }, pluginConfig, userConfig)
}
