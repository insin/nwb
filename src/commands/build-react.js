import path from 'path'

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
      vendorChunkName: args.vendor ? 'vendor' : null,
    },
  }

  if (args.preact) {
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
    return cb(new UserError('nwb: build-react: an entry module must be specified'))
  }

  let dist = args._[2] || 'dist'

  cleanApp({_: ['clean-app', dist]})

  console.log('nwb: build-react')
  webpackBuild(args, buildConfig, cb)
}
