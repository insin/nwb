/**
 * This module makes creation of final build config for serving a react app
 * accessible to middleware.
 */

import merge from 'webpack-merge'

/**
 * Creates a build configuration object which will be used to create a Webpack
 * config for serving a React app. Ensures React is available to do so.
 */
export default function(config) {
  let {staticPath = null, ...otherConfig} = config

  return merge(otherConfig, {
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
                imports: ['react'],
                locals: ['module']
              }, {
                transform: require.resolve('react-transform-catch-errors'),
                imports: ['react', require.resolve('redbox-noreact')]
              }]
            }
          }
        }
      }
    },
    server: {
      staticPath
    }
  })
}
