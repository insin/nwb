import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'

function buildDemo(args, cb) {
  if (glob.sync('demo/').length > 0) {
    require('./build-demo').default(args, cb)
  }
}

export default function(args, cb) {
  let userConfig = getUserConfig(args)
  if (userConfig.type === REACT_APP) {
    require('./build-react-app').default(args, cb)
  }
  if (userConfig.type === WEB_APP) {
    require('./build-web-app').default(args, cb)
  }
  else if (userConfig.type === REACT_COMPONENT || userConfig.type === WEB_MODULE) {
    require('./build-module').default(args)
    if (userConfig.umd) {
      require('./build-umd').default(args, () => buildDemo(args, cb))
    }
    else {
      buildDemo(args, cb)
    }
  }
}
