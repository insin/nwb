import serveReact from '../serveReact'
import createServeReactAppConfig from '../createServeReactAppConfig'

export default function(args, cb) {
  console.log('nwb: serve-react-app')
  serveReact(args, createServeReactAppConfig(), cb)
}
