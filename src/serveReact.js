import createServeReactAppBuildConfig from './createServeReactAppBuildConfig'
import webpackServer from './webpackServer'

/**
 * Start a development server with webpack dev and hot loading middelware,
 * configuring babel-loader with react-transform plugins for hot loading and
 * error catching.
 */
export default function(args, config) {
  webpackServer(args, createServeReactAppBuildConfig(config))
}
