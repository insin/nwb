import path from 'path'

import webpackBuild from '../webpackBuild'

// Use a config function, as this won't be called until after NODE_ENV has been
// set by webpackBuild() and we don't want these optimisations in development
// builds.
let buildConfig = () => {
  let config = {
    entry: path.resolve('src/index.js'),
    output: {
      filename: 'app.js',
      path: path.resolve('public/build'),
      publicPath: 'build/'
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
  console.log(`nwb: ${args._[0]}`)
  webpackBuild(args, buildConfig)
}
