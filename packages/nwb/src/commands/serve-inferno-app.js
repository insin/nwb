import createServeInfernoAppConfig from '../createServeInfernoAppConfig'
import webpackServer from '../webpackServer'

/**
 * Serve an Inferno app.
 */
export default function serveInfernoApp(args, cb) {
  webpackServer(args, createServeInfernoAppConfig(args), cb)
}
