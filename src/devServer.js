import opn from 'opn'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import merge from 'webpack-merge'

import debug from './debug'
import {deepToString, typeOf} from './utils'

/**
 * Use Webpack Dev Server to build and serve assets using Webpack's watch mode,
 * hot reload changes in the browser and display compile error overlays.
 *
 * Static content is handled by CopyPlugin.
 */
export default function devServer(webpackConfig, serverConfig, url, cb) {
  let compiler = webpack(webpackConfig)

  let {host, open, port, ...otherServerConfig} = serverConfig

  let webpackDevServerOptions = merge({
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    historyApiFallback: true,
    hot: true,
    overlay: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  }, otherServerConfig)

  debug('webpack dev server options: %s', deepToString(webpackDevServerOptions))

  let server = new WebpackDevServer(compiler, webpackDevServerOptions)
  server.listen(port, host, (err) => {
    if (err) return cb(err)
    if (open) {
      // --open
      if (typeOf(open) === 'boolean') opn(url)
      // --open=firefox
      else opn(url, {app: open})
    }
  })
}
