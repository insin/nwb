/**
 * This module makes creation of final build config for serving a React app
 * accessible to middleware.
 */

import merge from 'webpack-merge'

/**
 * Add React-specific config to a build configuration object which will be used
 * to create a Webpack config for serving a React app, so these details don't
 * need to be repeated everywhere.
 */
export default function createServeReactAppBuildConfig(config) {
  return merge(config, {
    babel: {
      commonJSInterop: true,
      presets: ['react', 'react-hmre'],
    }
  })
}
