import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'
import cleanApp from './clean-app'
import cleanDemo from './clean-demo'
import cleanModule from './clean-module'
import cleanUMD from './clean-umd'

export default function clean(args) {
  let {type, umd} = getUserConfig(args, {required: true})
  if (type === REACT_APP || type === WEB_APP) {
    cleanApp(args)
  }
  else if (type === REACT_COMPONENT || type === WEB_MODULE) {
    cleanModule(args)
    if (umd) {
      cleanUMD(args)
    }
    if (type === REACT_COMPONENT || glob.sync('demo/').length > 0) {
      cleanDemo(args)
    }
  }
}
