import createServePreactAppConfig from '../createServePreactAppConfig'
import webpackServer from '../webpackServer'

/**
 * Serve a Preact app.
 */
export default function servePreactApp(args, cb) {
  webpackServer(args, createServePreactAppConfig(args), cb)
}
