import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import {copyPublicDir} from '../utils'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

export default function buildWebApp(args, cb) {
  let entry = args._[1] || 'src/index.js'
  let dist = args._[2] || 'dist'

  cleanApp({_: ['clean-app', dist]})

  console.log('nwb: build-web-app')
  copyPublicDir('public', dist)
  webpackBuild(args, {
    devtool: 'source-map',
    entry: {
      app: path.resolve(entry),
    },
    output: {
      filename: '[name].js',
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor',
    },
  }, cb)
}
