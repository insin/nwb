import historyAPIFallback from 'connect-history-api-fallback'
import express from 'express'
import webpack from 'webpack'

/**
 * Start an Express server which uses webpack-dev-middleware to build and serve
 * assets using Webpack's watch mode, and webpack-hot-middleware to hot reload
 * changes in the browser and display compile error overlays.
 *
 * Static content is handled by CopyPlugin.
 */
export default function server(webpackConfig, {fallback, host, port, staticPath, proxy}, cb) {
  let app = express()
  let compiler = webpack(webpackConfig)

  if (proxy) {
    app.use(proxy.path, require('http-proxy-middleware')(proxy.options))
  }

  if (fallback !== false) {
    app.use(historyAPIFallback())
  }

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  }))

  app.use(require('webpack-hot-middleware')(compiler, {
    log: false,
  }))

  function onServerStart(err) {
    if (err) return cb(err)
  }

  // Only provide host config if it was explicitly specified by the user
  if (host) {
    app.listen(port, host, onServerStart)
  }
  else {
    app.listen(port, onServerStart)
  }
}
