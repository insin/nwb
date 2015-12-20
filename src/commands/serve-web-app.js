import path from 'path'

import webpackServer from '../webpackServer'

export default function(args, cb) {
  console.log('nwb: serve-web-app')
  webpackServer(args, {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('public/build'),
      filename: 'app.js',
      publicPath: '/build/'
    },
    server: {
      staticPath: path.resolve('public')
    }
  }, cb)
}
