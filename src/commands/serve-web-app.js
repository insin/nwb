import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackServer from '../webpackServer'

export default function(args, cb) {
  console.log('nwb: serve-web-app')
  webpackServer(args, {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('dist'),
      filename: 'app.js',
      publicPath: '/'
    },
    plugins: {
      html: getDefaultHTMLConfig()
    },
    server: {
      staticPath: path.resolve('public')
    }
  }, cb)
}
