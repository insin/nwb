import path from 'path'

import serveReact from '../serveReact'

export default function(args) {
  serveReact(args, {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('public/build'),
      filename: 'app.js',
      publicPath: '/build/'
    },
    staticPath: path.resolve('public')
  })
}
