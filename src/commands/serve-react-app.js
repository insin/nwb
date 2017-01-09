import createServeReactAppConfig from '../createServeReactAppConfig'
import webpackServer from '../webpackServer'

/**
 * Serve a React app.
 */
export default function serveReactApp(args, cb) {
  webpackServer(args, createServeReactAppConfig(args), cb)
}
