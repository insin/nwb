import assert from 'assert'

import createWebpackConfig from './createWebpackConfig'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'

/**
 * Creates the final Webpack config for serving a web app with hot reloading,
 * using build and user configuration.
 */
export default function(args, buildConfig) {
  let userConfig = getUserConfig(args)
  let pluginConfig = getPluginConfig(process.cwd())

  let {
    define, entry, output, loaders = {}, plugins
  } = buildConfig

  assert(entry, 'an entry file is required to serve a Webpack build')
  assert(output, 'output config is required to serve a Webpack build')

  let hotMiddlewareOptions = args.reload ? '?reload=true' : ''

  return createWebpackConfig(process.cwd(), {
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
    plugins: {
      define: {...define, ...userConfig.define},
      ...plugins
    }
  }, pluginConfig, userConfig)
}
