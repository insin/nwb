import {INFERNO_APP, PREACT_APP, REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'
import buildInfernoApp from './build-inferno-app'
import buildPreactApp from './build-preact-app'
import buildReactApp from './build-react-app'
import buildReactComponent from './build-react-component'
import buildWebApp from './build-web-app'
import buildWebModule from './build-web-module'

const BUILD_COMMANDS = {
  [INFERNO_APP]: buildInfernoApp,
  [PREACT_APP]: buildPreactApp,
  [REACT_APP]: buildReactApp,
  [REACT_COMPONENT]: buildReactComponent,
  [WEB_APP]: buildWebApp,
  [WEB_MODULE]: buildWebModule,
}

/**
 * Generic build command, invokes the appropriate project type-specific command.
 */
export default function build(args, cb) {
  let userConfig
  try {
    userConfig = getUserConfig(args, {required: true})
  }
  catch (e) {
    return cb(e)
  }

  BUILD_COMMANDS[userConfig.type](args, cb)
}
