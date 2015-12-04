import path from 'path'

// These are the top-level options for creating a webpack config for serving a
// React app, currently hardcoded as conventions.
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
