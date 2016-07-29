import serveReact from '../serveReact'
import createServeReactAppConfig from '../createServeReactAppConfig'

/**
 * Serve a React app.
 */
export default function serveReactApp(args, cb) {
  serveReact(args, createServeReactAppConfig(args), cb)
}
