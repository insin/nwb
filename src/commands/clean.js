import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let {type, umd} = getUserConfig(args)
  if (type === REACT_APP) {
    require('./clean-app')(args)
  }
  else if (type === REACT_COMPONENT || type === WEB_MODULE) {
    require('./clean-module')(args)
    if (umd) {
      require('./clean-umd')(args)
    }
    if (type === REACT_COMPONENT || glob.sync('demo/').length > 0) {
      require('./clean-demo')(args)
    }
  }
}
