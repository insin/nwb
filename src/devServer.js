import {cyan} from 'chalk'
import historyAPIFallback from 'connect-history-api-fallback'
import express from 'express'
import webpack from 'webpack'

import {clearConsole} from './utils'

/**
 * Start an Express server which uses webpack-dev-middleware to build and serve
 * assets using Webpack's watch mode, and webpack-hot-middleware to hot reload
 * changes in the browser and display compile error overlays.
 *
 * Static content is handled by CopyPlugin.
 */
export default function server(webpackConfig, {fallback, host, port, staticPath}, cb) {
  let app = express()
  let compiler = webpack(webpackConfig)

  if (fallback) {
    app.use(historyAPIFallback())
  }

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: false,
  }))

  function onServerStart(err) {
    if (err) return cb(err)
    clearConsole()
    console.log(cyan('Starting the development server...'))
    console.log()
  }

  // Only provide host config if it was explicitly specified by the user
  if (host) {
    app.listen(port, host, onServerStart)
  }
  else {
    app.listen(port, onServerStart)
  }
}
