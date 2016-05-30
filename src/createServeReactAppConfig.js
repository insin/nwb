import path from 'path'

import {getDefaultHTMLConfig} from './appConfig'

export default function() {
  return {
    entry: path.resolve('src/index.js'),
    output: {
      path: path.resolve('dist'),
      filename: 'app.js',
      publicPath: '/'
    },
    plugins: {
      html: getDefaultHTMLConfig()
    },
    staticPath: path.resolve('public')
  }
}
