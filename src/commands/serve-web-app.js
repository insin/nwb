import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackServer from '../webpackServer'

export default function serveWebApp(args, cb) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  webpackServer(args, {
    entry: [entry],
    output: {
      path: dist,
      filename: 'app.js',
      publicPath: '/',
    },
    plugins: {
      copy: [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}],
      html: getDefaultHTMLConfig(),
    },
  }, cb)
}
