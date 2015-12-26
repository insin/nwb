import path from 'path'

import webpackBuild from '../webpackBuild'

/**
 * Build a web module's demo app from demo/src/index.js.
 */
export default function(args, cb) {
  let pkg = require(path.resolve('package.json'))

  require('./clean-demo').default(args)

  console.log('nwb: build-demo')
  webpackBuild(args, {
    devtool: 'sourcemap',
    entry: {
      demo: path.resolve('demo/src/index.js')
    },
    output: {
      filename: '[name].js',
      path: path.resolve('demo/dist')
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`
      }
    },
    loaders: {
      babel: {
	query: {
	  presets: [
	    require.resolve('babel-preset-es2015'),
	    require.resolve('babel-preset-react'),
	    require.resolve('babel-preset-stage-2')
	  ]
	}
      }
    }
  }, cb)
}
