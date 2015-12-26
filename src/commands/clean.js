import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let {type, umd} = getUserConfig(args)
  if (type === REACT_APP || type === WEB_APP) {
    require('./clean-app').default(args)
  }
  else if (type === REACT_COMPONENT || type === WEB_MODULE) {
    require('./clean-module').default(args)
    if (umd) {
      require('./clean-umd').default(args)
    }
    if (type === REACT_COMPONENT || glob.sync('demo/').length > 0) {
      require('./clean-demo').default(args)
    }
  }
}
