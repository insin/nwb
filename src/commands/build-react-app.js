import path from 'path'

import {getDefaultHTMLConfig} from '../appConfig'
import {copyPublicDir} from '../utils'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = args._[1] || 'src/index.js'
  let dist = args._[2] || 'dist'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      presets: ['react'],
    },
    devtool: 'source-map',
    entry: {
      app: path.resolve(entry),
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
      vendorChunkName: 'vendor',
    },
  }

  if (args.preact) {
    config.resolve = {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
      },
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

  cleanApp({_: ['clean-app', dist]})

  console.log('nwb: build-react-app')
  copyPublicDir('public', dist)
  webpackBuild(args, buildConfig, cb)
}
