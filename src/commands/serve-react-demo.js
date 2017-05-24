import path from 'path'

import {directoryExists} from '../utils'
import webpackServer from '../webpackServer'

/**
 * Serve a React demo app from demo/src/index.js.
 */
export default function serveReactDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  let dist = path.resolve('demo/dist')

  let config = {
    babel: {
      presets: ['react'],
    },
    entry: [path.resolve('demo/src/index.js')],
    output: {
      filename: 'demo.js',
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`,
      },
    },
  }

  if (args.hmr !== false && args.hmre !== false) {
    config.babel.presets.push('react-hmre')
  }

  if (directoryExists('demo/public')) {
    config.plugins.copy = [{from: path.resolve('demo/public'), to: dist}]
  }

  webpackServer(args, config, cb)
}
