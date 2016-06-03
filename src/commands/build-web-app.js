import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import {copyPublicDir} from '../utils'

import webpackBuild from '../webpackBuild'

export default function(args, cb) {
  let entry = args._[1] || 'src/index.js'
  let dist = args._[2] || 'dist'

  require('./clean-app')({_: ['clean-app', dist]})

  console.log('nwb: build-web-app')
  copyPublicDir('public', dist)
  webpackBuild(args, {
    devtool: 'source-map',
    entry: {
      app: path.resolve(entry)
    },
    output: {
      filename: '[name].js',
      path: path.resolve(dist),
      publicPath: '/'
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor'
    }
  }, cb)
}
