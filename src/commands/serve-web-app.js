import createServeWebAppConfig from '../createServeWebAppConfig'
import webpackServer from '../webpackServer'

/**
 * Serve a plain JS app.
 */
export default function serveWebApp(args, cb) {
  webpackServer(args, createServeWebAppConfig(args), cb)
}
