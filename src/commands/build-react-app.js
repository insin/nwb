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
      path: path.resolve('public/build')
    },
    plugins: {
      vendorChunkName: 'vendor'
    }
  }
  if (process.env.NODE_ENV === 'production') {
    config.loaders = {
      babel: {
        query: {
	  presets: [
	    require.resolve('babel-preset-es2015'),
	    require.resolve('babel-preset-react'),
	    require.resolve('babel-preset-stage-2')
	  ],
	  plugins: [
	    require.resolve('babel-plugin-transform-react-inline-elements'),
	    require.resolve('babel-plugin-transform-react-constant-elements')
          ]
        }
      }
    }
  }
  return config
}

export default function(args, cb) {
  require('./clean-app').default(args)

  console.log(`nwb: build-react-app`)
  webpackBuild(args, buildConfig, cb)
}
