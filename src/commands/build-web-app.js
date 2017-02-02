import path from 'path'

import glob from 'glob'
import runSeries from 'run-series'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    devtool: 'source-map',
    entry: {
      app: [entry],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendor: args.vendor !== false,
    },
  }

  if (glob.sync('public/').length !== 0) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  return config
}

/**
 * Build a plain JS app.
 */
export default function buildWebApp(args, cb) {
  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`app`, args, buildConfig, cb),
  ], cb)
}
