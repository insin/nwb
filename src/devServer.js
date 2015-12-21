import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
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
export default function server(webpackConfig, {fallback, noInfo, port, staticPath}, cb) {
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

  if (fallback) {
    app.use((req, res, next) => {
      // Only fall back for GET methods which accept HTML and don't appear to
      // end with a file extension.
      if (req.method !== 'GET' || !req.accepts('html') || /\.[\w]{1,4}$/i.test(req.path)) {
        return next()
      }
      fs.readFile(path.resolve('public/index.html'), 'utf8', (err, html) => {
        if (err) return next(err)
        // Rewrite relative build URLs to be absolute so they work from any path
        res.send(html.replace(/="build\//g, '="/build/'))
      })
    })
  }

  app.listen(port, 'localhost', err => {
    if (err) return cb(err)
    console.log(chalk.green(`nwb: dev server listening at http://localhost:${port}`))
  })
}
