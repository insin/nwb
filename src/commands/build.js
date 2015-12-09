import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

function buildDemo(args) {
  if (glob.sync('demo/').length > 0) {
    require('./build-demo')(args)
  }
}

export default function(args) {
  let userConfig = getUserConfig(args)
  if (userConfig.type === REACT_APP) {
    require('./build-react-app')(args)
  }
  else if (userConfig.type === REACT_COMPONENT || userConfig.type === WEB_MODULE) {
    require('./build-module')(args)
    if (userConfig.umd) {
      require('./build-umd')(args, () => buildDemo(args))
    }
    else {
      buildDemo(args)
    }
  }
}
