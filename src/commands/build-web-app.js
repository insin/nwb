import path from 'path'

import webpackBuild from '../webpackBuild'

export default function(args, cb) {
  require('./clean-app')(args)

  console.log(`nwb: build-web-app`)
  webpackBuild(args, {
    devtool: 'source-map',
    entry: {
      app: path.resolve('src/index.js')
    },
    output: {
      filename: '[name].js',
      path: path.resolve('public/build'),
      publicPath: '/build/'
    },
    plugins: {
      vendorChunkName: 'vendor'
    }
  }, cb)
}
