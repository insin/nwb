import {REACT_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let {type} = getUserConfig(args)
  if (type === REACT_APP) {
    require('./clean-app')
  }
  else if (type === WEB_MODULE) {
    require('./clean-module')
  }
}
