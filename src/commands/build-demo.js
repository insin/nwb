import path from 'path'

import webpackBuild from '../webpackBuild'
import cleanDemo from './clean-demo'

/**
 * Build a module's demo app from demo/src/index.js.
 */
export default function buildDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  cleanDemo(args)

  console.log('nwb: build-demo')
  webpackBuild(args, {
    babel: {
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      demo: path.resolve('demo/src/index.js'),
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: path.resolve('demo/dist'),
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`,
      },
    },
  }, cb)
}
