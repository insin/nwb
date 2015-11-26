import express from 'express'
import webpack from 'webpack'

module.exports = function server(webpackConfig, {noInfo, port, staticPath}) {
  var app = express()
  var compiler = webpack(webpackConfig)

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: noInfo,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }))

  app.use(require('webpack-hot-middleware')(compiler))

  app.use(express.static(staticPath))

  app.listen(port, 'localhost', function(err) {
    if (err) {
      console.error(err.stack)
      process.exit(1)
    }
    console.log(`nwb dev server listening at http://localhost:${port}`)
  })
}
