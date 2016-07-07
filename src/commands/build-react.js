import path from 'path'

import {UserError} from '../errors'
import webpackBuild from '../webpackBuild'

// Use a config function, as this won't be called until after NODE_ENV has been
// set by webpackBuild() and we don't want these optimisations in development
// builds.
let buildConfig = (args) => {
  let entry = args._[1]
  let dist = args._[2] || 'dist'

  let config = {
    devtool: 'source-map',
    entry: {
      app: path.resolve(entry)
    },
    output: {
      filename: '[name].js',
      path: path.resolve(dist),
      publicPath: '/'
    },
    loaders: {
      babel: {
        query: {
          stage: 0,
          optional: ['runtime']
        }
      }
    },
    plugins: {
      html: {
        mountId: args['mount-id'] || 'app',
        title: args.title || 'React App'
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendorChunkName: args.vendor ? 'vendor' : null
    }
  }

  if (args.preact) {
    config.resolve = {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat'
      }
    }
  }

  if (process.env.NODE_ENV === 'production' && !args.preact) {
    config.loaders.babel.query.optional = [
      'optimisation.react.inlineElements',
      'optimisation.react.constantElements'
    ]
  }

  return config
}

/**
 * Build a standalone React entry module.
 */
export default function(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('nwb: build-react: an entry module must be specified'))
  }

  let dist = args._[2] || 'dist'

  require('./clean-app')({_: ['clean-app', dist]})

  console.log('nwb: build-react')
  webpackBuild(args, buildConfig, cb)
}
