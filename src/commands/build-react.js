import path from 'path'

import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = args._[1]
  let dist = args._[2] || 'dist'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      commonJSInterop: true,
      stage: 0,
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      app: [path.resolve(entry)]
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId: args['mount-id'] || 'app',
        title: args.title || 'React App',
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
  }

  if (args.inferno) {
    config.resolve = {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    }
  }
  else if (args.preact) {
    config.resolve = {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
      }
    }
  }

  if (production) {
    config.babel.presets.push('react-prod')
  }

  return config
}

/**
 * Build a standalone React entry module.
 */
export default function buildReact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be given.'))
  }

  let dist = args._[2] || 'dist'

  let library = 'React'
  if (args.inferno) library = 'Inferno (React compat)'
  else if (args.preact) library = 'Preact (React compat)'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`${library} app`, args, buildConfig, cb),
  ], cb)
}
