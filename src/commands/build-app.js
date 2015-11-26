// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

import path from 'path'

import webpack from 'webpack'

import createWebpackConfig from '../createWebpackConfig'
import getUserConfig from '../getUserConfig'

export default function(args, buildConfig = {}) {
  let userConfig = getUserConfig(args.config)
  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig()
  }

  let cwd = process.cwd()

  var webpackConfig = createWebpackConfig(cwd, {
    server: false,
    devtool: 'source-map',
    entry: path.resolve('src/index.js'),
    output: {
      filename: 'app.js',
      path: path.resolve('public/build'),
      publicPath: 'build/'
    },
    loaders: buildConfig.loaders,
    plugins: {
      define: {...buildConfig.define, ...userConfig.define},
      appStyle: 'style.css',
      vendorJS: 'vendor.js'
    }
  }, userConfig.webpack)

  let compiler = webpack(webpackConfig)

  console.log('nwb: build-app')
  compiler.run((err, stats) => {
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
