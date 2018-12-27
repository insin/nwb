// @flow
import createWebpackConfig from './createWebpackConfig'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'

import type {ServerConfig} from './types'

/**
 * Create Webpack entry config for the client which will subscribe to Hot Module
 * Replacement updates.
 */
function getHMRClientEntries(args: Object, serverConfig: ?ServerConfig): string[] {
  // null config indicates we're creating config for use in Express middleware,
  // where the server config is out of our hands and we're using
  // webpack-hot-middleware for HMR.
  if (serverConfig == null) {
    let hotMiddlewareOptions = args.reload ? '?reload=true' : ''
    return [
      // Polyfill EventSource for IE, as webpack-hot-middleware/client uses it
      require.resolve('eventsource-polyfill'),
      require.resolve('webpack-hot-middleware/client') + hotMiddlewareOptions,
    ]
  }

  let entries = [
    require.resolve(`webpack/hot/${args.reload ? '' : 'only-'}dev-server`),
  ]

  // inline mode adds the client for us
  if (!serverConfig.inline){
    // Otherwise, we're using webpack-dev-server's client
    let hmrURL = '/'
    // Set full HMR URL if the user customised it (#279)
    if (args.host || args.port) {
      hmrURL = `http://${serverConfig.host || 'localhost'}:${serverConfig.port}/`
    }
    entries.unshift(require.resolve('webpack-dev-server/client') + `?${hmrURL}`)
  }

  return entries
}

/**
 * Creates Webpack config for serving a watch build with Hot Module Replacement.
 */
export default function createServerWebpackConfig(
  args: Object,
  commandConfig: Object,
  serverConfig: ?ServerConfig,
) {
  let pluginConfig = getPluginConfig(args)
  let userConfig = getUserConfig(args, {pluginConfig})
  let {entry, plugins = {}, ...otherCommandConfig} = commandConfig

  if (args['auto-install'] || args.install) {
    plugins.autoInstall = true
  }

  return createWebpackConfig({
    server: true,
    devtool: 'cheap-module-source-map',
    entry: getHMRClientEntries(args, serverConfig).concat(entry),
    plugins,
    ...otherCommandConfig,
  }, pluginConfig, userConfig)
}
