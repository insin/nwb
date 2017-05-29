import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import merge from 'webpack-merge'

/**
 * Use Webpack Dev Server to build and serve assets using Webpack's watch mode,
 * hot reload changes in the browser and display compile error overlays.
 *
 * Static content is handled by CopyPlugin.
 */
export default function devServer(webpackConfig, serverConfig, cb) {
  let compiler = webpack(webpackConfig)

  let {host, port, ...otherServerConfig} = serverConfig

  let server = new WebpackDevServer(compiler, merge({
    historyApiFallback: true,
    hot: true,
    noInfo: true,
    overlay: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  }, otherServerConfig))

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
