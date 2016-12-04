import path from 'path'

import glob from 'glob'
import ora from 'ora'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import {logBuildResults} from '../webpackUtils'
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
    babel: {
      commonJSInterop: true,
      presets: ['preact'],
    },
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
 * Build a Preact app.
 */
export default function buildPreactApp(args, cb) {
  let dist = args._[2] || 'dist'

  cleanApp({_: ['clean-app', dist]})

  let spinner = ora(`Building Preact app`).start()
  webpackBuild(args, buildConfig, (err, stats) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    logBuildResults(stats, spinner)
    cb()
  })
}
