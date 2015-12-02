import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let {type, umd} = getUserConfig(args)
  if (type === REACT_APP) {
    require('./clean-app')
  }
  else if (type === REACT_COMPONENT || type === WEB_MODULE) {
    require('./clean-module')
    if (umd) {
      require('./clean-umd')
    }
    if (type === REACT_COMPONENT || glob.sync('demo/').length > 0) {
      require('./clean-demo')
    }
  }
}
