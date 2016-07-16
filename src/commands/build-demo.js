import path from 'path'

import webpackBuild from '../webpackBuild'
import cleanDemo from './clean-demo'

/**
 * Build a module's demo app from demo/src/index.js.
 */
export default function buildDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  cleanDemo(args)

  console.log('nwb: build-demo')
  webpackBuild(args, {
    babel: {
      presets: ['react'],
    },
    devtool: 'sourcemap',
    entry: {
      demo: path.resolve('demo/src/index.js'),
    },
    output: {
      filename: '[name].js',
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
