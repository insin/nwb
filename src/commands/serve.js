import {REACT_APP, REACT_COMPONENT, WEB_APP} from '../constants'
import {UserError} from '../errors'
import getUserConfig from '../getUserConfig'
import serveReactApp from './serve-react-app'
import serveReactDemo from './serve-react-demo'
import serveWebApp from './serve-web-app'

export default function serve(args, cb) {
  let userConfig = getUserConfig(args, {required: true})
  if (userConfig.type === REACT_APP) {
    serveReactApp(args, cb)
  }
  else if (userConfig.type === WEB_APP) {
    serveWebApp(args, cb)
  }
  else if (userConfig.type === REACT_COMPONENT) {
    serveReactDemo(args, cb)
  }
  else {
    cb(new UserError('nwb: unable to serve anything in the current directory'))
  }
}
