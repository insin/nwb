import {REACT_APP, REACT_COMPONENT, WEB_APP} from '../constants'
import {UserError} from '../errors'
import getUserConfig from '../getUserConfig'

export default function(args, cb) {
  let userConfig = getUserConfig(args)
  if (userConfig.type === REACT_APP) {
    require('./serve-react-app').default(args, cb)
  }
  else if (userConfig.type === WEB_APP) {
    require('./serve-web-app').default(args, cb)
  }
  else if (userConfig.type === REACT_COMPONENT) {
    require('./serve-react-demo').default(args, cb)
  }
  else {
    cb(new UserError('nwb: unable to serve anything in the current directory'))
  }
}
