import path from 'path'

import runSeries from 'run-series'

import {getDefaultHTMLConfig} from '../appConfig'
import {directoryExists} from '../utils'
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
    babel: {
      presets: ['inferno'],
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
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    },
  }

  if (directoryExists('public')) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  return config
}

/**
 * Build an Inferno app.
 */
export default function buildInfernoApp(args, cb) {
  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild('Inferno app', args, buildConfig, cb),
  ], cb)
}
