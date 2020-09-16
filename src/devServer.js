import opn from 'open'
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

  // In case of an array of config, use the first config
  // as the 'default' config for public path extraction
  if (Array.isArray(webpackConfig)) {
    webpackConfig = webpackConfig[0]
  }

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

  // XXX Temporarily replace console.info() to prevent WDS startup logging which
  //     is explicitly done at the info level when the quiet option is set.
  let info = console.info
  console.info = () => {}
  server.listen(port, host, (err) => {
    console.info = info
    if (err) return cb(err)
    if (open) {
      // --open
      if (typeOf(open) === 'boolean') opn(url, {url: true})
      // --open=firefox
      else opn(url, {app: open, url: true})
    }
  })
}
