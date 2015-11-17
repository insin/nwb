// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

var webpack = require('webpack')

var getUserConfig = require('../getUserConfig')
var webpackConfig = require('../webpack.app.config.js')

module.exports = function(args, options) {
  var userConfig = getUserConfig('build', args.config)
  var compiler = webpack(
    webpackConfig({
      cwd: process.cwd(),
      react: options.react
    }, userConfig)
  )

  console.log('nwb: build-app')
  compiler.run(function(err, stats) {
    if (err) {
      console.error('webpack build error:')
      console.error(err.stack)
      process.exit(1)
    }
    console.log(stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false
    }))
  })
}
