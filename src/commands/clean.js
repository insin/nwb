import {getProjectType} from '../config'
import {INFERNO_APP, PREACT_APP, REACT_APP, REACT_COMPONENT, WEB_APP, WEB_MODULE} from '../constants'
import cleanApp from './clean-app'
import cleanModule from './clean-module'

const CLEAN_COMMANDS = {
  [INFERNO_APP]: cleanApp,
  [PREACT_APP]: cleanApp,
  [REACT_APP]: cleanApp,
  [REACT_COMPONENT]: cleanModule,
  [WEB_APP]: cleanApp,
  [WEB_MODULE]: cleanModule,
}

/**
 * Generic clean command, invokes the appropriate project type-specific command.
 */
export default function clean(args, cb) {
  let projectType
  try {
    projectType = getProjectType(args)
  }
  catch (e) {
    return cb(e)
  }

  CLEAN_COMMANDS[projectType](args, cb)
}
