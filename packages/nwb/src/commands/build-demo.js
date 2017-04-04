import path from 'path'

import runSeries from 'run-series'

import {directoryExists} from '../utils'
import webpackBuild from '../webpackBuild'
import cleanDemo from './clean-demo'

/**
 * Build a module's demo app from demo/src/index.js.
 */
export default function buildDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  let dist = path.resolve('demo/dist')
  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      demo: [path.resolve('demo/src/index.js')],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: dist,
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`,
      },
    },
  }

  if (directoryExists('demo/public')) {
    config.plugins.copy = [{from: path.resolve('demo/public'), to: dist}]
  }

  runSeries([
    (cb) => cleanDemo(args, cb),
    (cb) => webpackBuild('demo', args, config, cb),
  ], cb)
}
