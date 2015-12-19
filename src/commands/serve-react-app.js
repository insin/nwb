import createServeReactAppConfig from '../createServeReactAppConfig'
import serveReact from '../serveReact'

export default function(args, cb) {
  console.log('nwb: serve-react-app')
  serveReact(args, createServeReactAppConfig(), cb)
}
