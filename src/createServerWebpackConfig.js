import createWebpackConfig from './createWebpackConfig'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'

/**
 * Creates the final Webpack config for serving a web app with hot reloading,
 * using build and user configuration.
 */
export default function createServerWebpackConfig(args, buildConfig) {
  let userConfig = getUserConfig(args)
  let pluginConfig = getPluginConfig()
  let {entry, output, plugins = {}, ...otherBuildConfig} = buildConfig
  let hotMiddlewareOptions = args.reload ? '?reload=true' : ''

  if (args['auto-install']) {
    plugins.install = {}
  }

  return createWebpackConfig({
    devtool: '#eval-source-map',
    entry: [
      // Polyfill EventSource for IE, as webpack-hot-middleware/client uses it
      require.resolve('eventsource-polyfill'),
      require.resolve('webpack-hot-middleware/client') + hotMiddlewareOptions,
      entry,
    ],
    output,
    plugins,
    server: true,
    ...otherBuildConfig,
  }, pluginConfig, userConfig)
}
