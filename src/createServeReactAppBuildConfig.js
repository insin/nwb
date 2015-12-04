import assert from 'assert'

import resolve from 'resolve'

/**
 * Creates a build configuration object which will be used to create a Webpack
 * config for serving a React app.
 */
export default function(config) {
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
    console.error('nwb: React must be installed locally to serve a React app')
    process.exit(1)
  }

  return {
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
  }
}
