import assert from 'assert'

import resolve from 'resolve'

import webpackServer from './webpackServer'

/**
 * Start a development server with webpack dev and hot loading middelware,
 * configuring babel-loader with react-transform plugins for hot loading and
 * error catching.
 */
export default function(args, config) {
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
    console.error('React must be installed locally to serve a React app')
    process.exit(1)
  }

  // Start the development server
  webpackServer(args, {
    entry,
    output,
    loaders: {
      babel: {
        // Configure hot reloading and error catching via react-transform
        query: {
          plugins: [
            require.resolve('babel-plugin-react-display-name'),
            require.resolve('babel-plugin-react-transform')
          ],
          extra: {
            'react-transform': {
              transforms: [{
                transform: require.resolve('react-transform-hmr'),
                imports: [reactPath],
                locals: ['module']
              }, {
                transform: require.resolve('react-transform-catch-errors'),
                imports: [reactPath, require.resolve('redbox-noreact')]
              }]
            }
          }
        }
      }
    },
    plugins,
    server: {
      staticPath
    }
  })
}
