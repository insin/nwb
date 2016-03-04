import path from 'path'

export default function() {
  return {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('dist'),
      filename: 'app.js',
      publicPath: '/'
    },
    plugins: {
      html: {
        template: path.resolve('src/index.html')
      }
    },
    staticPath: path.resolve('public')
  }
}
