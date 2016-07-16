/**
 * This module makes creation of final build config for serving a react app
 * accessible to middleware.
 */

import merge from 'webpack-merge'

/**
 * Creates a build configuration object which will be used to create a Webpack
 * config for serving a React app.
 */
export default function createServeReactAppBuildConfig(config) {
  let {staticPath = null, ...otherConfig} = config

  return merge(otherConfig, {
    babel: {
      presets: ['react', 'react-hmre'],
    },
    server: {
      staticPath,
    },
  })
}
