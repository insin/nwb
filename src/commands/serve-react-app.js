import path from 'path'

import serveReact from '../serveReact'

export default function(args, cb) {
  console.log('nwb: serve-react-app')
  serveReact(args, {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('public/build'),
      filename: 'app.js',
      publicPath: '/build/'
    },
    staticPath: path.resolve('public')
  }, cb)
}
