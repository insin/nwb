import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import {copyPublicDir} from '../utils'
import webpackBuild from '../webpackBuild'

// Use a config function, as this won't be called until after NODE_ENV has been
// set by webpackBuild() and we don't want these optimisations in development
// builds.
let buildConfig = (args) => {
  let entry = args._[1] || 'src/index.js'
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
    plugins: {
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor'
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
    config.loaders = {
      babel: {
        query: {
          optional: [
            'optimisation.react.inlineElements',
            'optimisation.react.constantElements'
          ]
        }
      }
    }
  }

  return config
}

/**
 * Build a React app.
 */
export default function(args, cb) {
  let dist = args._[2] || 'dist'

  require('./clean-app')({_: ['clean-app', dist]})

  console.log('nwb: build-react-app')
  copyPublicDir('public', dist)
  webpackBuild(args, buildConfig, cb)
}
