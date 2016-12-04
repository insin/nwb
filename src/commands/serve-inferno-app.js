import path from 'path'

import glob from 'glob'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackServer from '../webpackServer'

/**
 * Serve an Inferno app.
 */
export default function serveInfernoApp(args, cb) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config = {
    babel: {
      commonJSInterop: true,
      presets: ['inferno'],
    },
    entry: [path.resolve(entry)],
    output: {
      filename: 'app.js',
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig()
    }
  }

  if (glob.sync('public/').length !== 0) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  webpackServer(args, config, cb)
}
