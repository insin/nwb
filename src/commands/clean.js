import {REACT_APP, REACT_COMPONENT, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let {type} = getUserConfig(args)
  if (type === REACT_APP) {
    require('./clean-app')
  }
  else if (type === REACT_COMPONENT || type === WEB_MODULE) {
    require('./clean-module')
  }
}
