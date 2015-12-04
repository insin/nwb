import express from 'express'
import webpack from 'webpack'

/**
 * Start an express server which uses webpack-dev-middleware to build and serve
 * assets using Webpack's watch mode, and webpack-hot-middleware to hot reload
 * changes in the browser.
 *
 * If static path config is also provided, express will also be used to serve
 * static content from the given path.
 */
export default function server(webpackConfig, {noInfo, port, staticPath}) {
  let app = express()
  let compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }))

  app.use(require('webpack-hot-middleware')(compiler))

  if (staticPath) {
    app.use(express.static(staticPath))
  }

  app.listen(port, 'localhost', err => {
    if (err) {
      console.error('nwb: error starting dev server:')
      console.error(err.stack)
      process.exit(1)
    }
    console.log(`nwb: dev server listening at http://localhost:${port}`)
  })
}
