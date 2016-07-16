import createServeReactAppBuildConfig from './createServeReactAppBuildConfig'
import webpackServer from './webpackServer'

/**
 * Start a development server with webpack dev and hot loading middleware,
 * configuring babel-loader with react-transform plugins for hot loading and
 * error catching.
 */
export default function serveReact(args, config, cb) {
  webpackServer(args, createServeReactAppBuildConfig(config), cb)
}
