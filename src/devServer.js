import {cyan} from 'chalk'
import history from 'connect-history-api-fallback'
import express from 'express'
import webpack from 'webpack'
import {clearConsole} from './WebpackDXPlugin'

/**
 * Start an express server which uses webpack-dev-middleware to build and serve
 * assets using Webpack's watch mode, and webpack-hot-middleware to hot reload
 * changes in the browser.
 *
 * If static path config is provided, express will serve static content from it.
 */
export default function server(webpackConfig, {fallback, host, port, staticPath}, cb) {
  let app = express()
  let compiler = webpack(webpackConfig)

  if (fallback) {
    app.use(history())
  }

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: false,
  }))

  if (staticPath) {
    app.use(express.static(staticPath))
  }

  app.listen(port, host, (err) => {
    if (err) return cb(err)
    clearConsole()
    console.log(cyan('Starting the development server...'))
    console.log()
  })
}
