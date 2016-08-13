import path from 'path'

import ora from 'ora'

import webpackBuild from '../webpackBuild'
import {logBuildResults} from '../webpackUtils'
import cleanDemo from './clean-demo'

/**
 * Build a module's demo app from demo/src/index.js.
 */
export default function buildDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  cleanDemo(args)

  let spinner = ora('Building demo').start()
  webpackBuild(args, {
    babel: {
      commonJSInterop: true,
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      demo: [path.resolve('demo/src/index.js')],
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
  }, (err, stats) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    logBuildResults(stats, spinner)
    cb()
  })
}
