import path from 'path'

import ora from 'ora'

import {getDefaultHTMLConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import {logBuildResults} from '../webpackUtils'
import cleanApp from './clean-app'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = args._[1] || 'src/index.js'
  let dist = args._[2] || 'dist'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  return {
    devtool: 'source-map',
    entry: {
      app: [path.resolve(entry)],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      copy: [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}],
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor',
    },
  }
}

/**
 * Build a plain JS app.
 */
export default function buildWebApp(args, cb) {
  let dist = args._[2] || 'dist'

  cleanApp({_: ['clean-app', dist]})

  let spinner = ora('Building app').start()
  webpackBuild(args, buildConfig, (err, stats) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    logBuildResults(stats, spinner)
    cb()
  })
}
