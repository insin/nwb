import assert from 'assert'

import resolve from 'resolve'

import {UserError} from './errors'

/**
 * Creates a build configuration object which will be used to create a Webpack
 * config for serving a React app.
 */
export default function (config) {
  let {
    entry,
    output,
    plugins,
    staticPath = null
    } = config

  assert(entry, 'entry config is required to serve a React app')
  assert(output, 'output config is required to serve a React app')

  // Find the locally-installed version of React
  let reactPath
  try {
    reactPath = resolve.sync('react', {basedir: process.cwd()})
  }
  catch (e) {
    throw new UserError('nwb: React must be installed locally to serve a React app')
  }

  return {
    entry,
    output,
    loaders: {
      babel: {
        query: {
	  presets: [
	    require.resolve('babel-preset-es2015'),
	    require.resolve('babel-preset-react'),
	    require.resolve('babel-preset-stage-2')
          ],
	  // Configure hot reloading and error catching via react-transform
	  plugins: [
	    [
	      require.resolve('babel-plugin-transform-react-display-name'),
	      require.resolve('babel-plugin-react-transform'), {
		transforms: [{
		  transform: require.resolve('react-transform-hmr'),
		  imports: [reactPath],
		  locals: ['module']
		}, {
		  transform: require.resolve('react-transform-catch-errors'),
		  imports: [reactPath, require.resolve('redbox-noreact')]
		}]
	      }
	    ]
	  ]
        }
      }
    },
    plugins,
    server: {
      staticPath
    }
  }
}
