import {REACT_APP, REACT_COMPONENT} from '../constants'
import {UserError} from '../errors'
import getUserConfig from '../getUserConfig'

export default function(args, cb) {
  let userConfig = getUserConfig(args)
  if (userConfig.type === REACT_APP) {
    require('./serve-react-app')(args)
  }
  else if (userConfig.type === REACT_COMPONENT) {
    require('./serve-react-demo')(args)
  }
  else {
    cb(new UserError('nwb: unable to serve anything in the current directory'))
  }
}
