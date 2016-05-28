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
  let pluginConfig = getPluginConfig()

  let {entry, output, plugins = {}, ...otherBuildConfig} = buildConfig

  assert(entry, 'an entry file is required to serve a Webpack build')
  assert(output, 'output config is required to serve a Webpack build')

  let hotMiddlewareOptions = args.reload ? '?reload=true' : ''

  if (args['auto-install']) {
    plugins.install = {}
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
    plugins,
    ...otherBuildConfig
  }, pluginConfig, userConfig.webpack)
}
