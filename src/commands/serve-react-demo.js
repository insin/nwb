import path from 'path'

import {DEFAULT_BROWSERS_DEV} from '../constants'
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
      env: {
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
      presets: ['react'],
      targets: DEFAULT_BROWSERS_DEV,
    },
    entry: [path.resolve('demo/src/index.js')],
    output: {
      filename: 'demo.js',
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        lang: 'en',
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`,
      },
    },
  }

  if (args.hmr !== false) {
    config.babel.plugins = [require.resolve('react-refresh/babel')]
    config.plugins.reactRefresh = true
  }

  if (directoryExists('demo/public')) {
    config.plugins.copy = [{from: path.resolve('demo/public'), to: dist}]
  }

  webpackServer(args, config, cb)
}
