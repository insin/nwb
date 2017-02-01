import path from 'path'

import glob from 'glob'
import runSeries from 'run-series'

import {getDefaultHTMLConfig} from '../appConfig'
import {install} from '../utils'
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
      presets: ['react'],
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

  if (args.inferno || args['inferno-compat']) {
    config.resolve = {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    }
  }
  else if (args.preact || args['preact-compat']) {
    config.resolve = {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    }
  }

  if (production) {
    config.babel.presets.push('react-prod')
  }

  return config
}

/**
 * Build a React app.
 */
export default function buildReactApp(args, cb) {
  let dist = args._[2] || 'dist'

  let library = 'React'
  let packages = []
  if (args.inferno || args['inferno-compat']) {
    library = 'Inferno (React compat)'
    packages = ['inferno', 'inferno-compat']
  }
  else if (args.preact || args['preact-compat']) {
    library = 'Preact (React compat)'
    packages = ['preact', 'preact-compat']
  }

  runSeries([
    (cb) => install(packages, {check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`${library} app`, args, buildConfig, cb),
  ], cb)
}
