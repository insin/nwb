import path from 'path'

import webpackBuild from '../webpackBuild'

// Use a config function, as this won't be called until after NODE_ENV has been
// set by webpackBuild() and we don't want these optimisations in development
// builds.
let buildConfig = () => {
  let config = {
    devtool: 'source-map',
    entry: {
      app: path.resolve('src/index.js')
    },
    output: {
      filename: '[name].js',
      path: path.resolve('public/build'),
      publicPath: 'build/'
    },
    plugins: {
      vendorChunkName: 'vendor'
    }
  }
  if (process.env.NODE_ENV === 'production') {
    config.loaders = {
      babel: {
        optional: [
          'optimisation.react.inlineElements',
          'optimisation.react.constantElements'
        ]
      }
    }
  }
  return config
}

export default function(args) {
  require('./clean-app')

  console.log(`nwb: build-react-app`)
  webpackBuild(args, buildConfig)
}
