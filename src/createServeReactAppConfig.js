import path from 'path'

export default function() {
  return {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('public/build'),
      filename: 'app.js',
      publicPath: '/build/'
    },
    staticPath: path.resolve('public')
  }
}
