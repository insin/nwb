import {REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import getUserConfig from '../getUserConfig'
import cleanApp from './clean-app'
import cleanModule from './clean-module'

const CLEAN_COMMANDS = {
  [REACT_APP]: cleanApp,
  [REACT_COMPONENT]: cleanModule,
  [WEB_APP]: cleanApp,
  [WEB_MODULE]: cleanModule,
}

/**
 * Generic clean command, invokes the appropriate project type-specific command.
 */
export default function clean(args, cb) {
  let userConfig = getUserConfig(args, {required: true})
  CLEAN_COMMANDS[userConfig.type](args, cb)
}
