import glob from 'glob'

import {REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'
import buildDemo from './build-demo'
import buildModule from './build-module'
import buildReactApp from './build-react-app'
import buildUMD from './build-umd'
import buildWebApp from './build-web-app'

function runBuildDemo(args, cb) {
  if (glob.sync('demo/').length > 0) {
    buildDemo(args, cb)
  }
}

export default function build(args, cb) {
  let userConfig = getUserConfig(args, {required: true})
  if (userConfig.type === REACT_APP) {
    buildReactApp(args, cb)
  }
  else if (userConfig.type === WEB_APP) {
    buildWebApp(args, cb)
  }
  else if (userConfig.type === REACT_COMPONENT || userConfig.type === WEB_MODULE) {
    buildModule(args)
    if (userConfig.build.umd) {
      buildUMD(args, () => runBuildDemo(args, cb))
    }
    else {
      runBuildDemo(args, cb)
    }
  }
}
