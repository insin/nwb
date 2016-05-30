import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import {copyPublicDir} from '../utils'

import webpackBuild from '../webpackBuild'

export default function(args, cb) {
  require('./clean-app')(args)

  copyPublicDir('public', 'dist')

  console.log('nwb: build-web-app')
  webpackBuild(args, {
    devtool: 'source-map',
    entry: {
      app: path.resolve('src/index.js')
    },
    output: {
      filename: '[name].js',
      path: path.resolve('dist'),
      publicPath: '/'
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor'
    }
  }, cb)
}
