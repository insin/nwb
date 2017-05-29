import createWebpackConfig from './createWebpackConfig'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'

/**
 * Creates the final Webpack config for serving a web app with hot reloading,
 * using build and user configuration.
 */
export default function createServerWebpackConfig(args, buildConfig, serverConfig) {
  let pluginConfig = getPluginConfig(args)
  let userConfig = getUserConfig(args, {pluginConfig})
  let {entry, plugins = {}, ...otherBuildConfig} = buildConfig

  if (args['auto-install'] || args.install) {
    plugins.autoInstall = true
  }

  let hmrURL = '/'

  return createWebpackConfig({
    server: true,
    devtool: 'cheap-module-source-map',
    entry: [
      require.resolve('webpack-dev-server/client') + `?${hmrURL}`,
      require.resolve(`webpack/hot/${args.reload ? '' : 'only-'}dev-server`),
    ].concat(entry),
    plugins,
    ...otherBuildConfig,
  }, pluginConfig, userConfig)
}
