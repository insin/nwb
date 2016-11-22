import path from 'path'

import glob from 'glob'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackServer from '../webpackServer'

export default function serveWebApp(args, cb) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config = {
    babel: {
      commonJSInterop: true,
    },
    entry: [entry],
    output: {
      path: dist,
      filename: 'app.js',
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
    },
  }

  if (glob.sync('public/').length !== 0) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  webpackServer(args, config, cb)
}
