import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import merge from 'webpack-merge'

import debug from './debug'
import {deepToString} from './utils'

/**
 * Use Webpack Dev Server to build and serve assets using Webpack's watch mode,
 * hot reload changes in the browser and display compile error overlays.
 *
 * Static content is handled by CopyPlugin.
 */
export default function devServer(webpackConfig, serverConfig, cb) {
  let {host, port, ...otherServerConfig} = serverConfig

  let webpackDevServerOptions = merge({
    historyApiFallback: true,
    hot: true,
    noInfo: true,
    overlay: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  }, otherServerConfig)

  WebpackDevServer.addDevServerEntrypoints(webpackConfig, webpackDevServerOptions)
  let compiler = webpack(webpackConfig)

  debug('webpack dev server options: %s', deepToString(webpackDevServerOptions))

  let server = new WebpackDevServer(compiler, webpackDevServerOptions)

  function onServerStart(err) {
    if (err) cb(err)
  }

  // Only provide host config if it was explicitly specified by the user
  if (host) {
    server.listen(port, host, onServerStart)
  }
  else {
    server.listen(port, onServerStart)
  }
}
