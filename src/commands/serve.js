// @flow
import {getProjectType} from '../config'
import {INFERNO_APP, PREACT_APP, REACT_APP, REACT_COMPONENT, WEB_APP} from '../constants'
import {UserError} from '../errors'
import serveInfernoApp from './serve-inferno-app'
import servePreactApp from './serve-preact-app'
import serveReactApp from './serve-react-app'
import serveReactDemo from './serve-react-demo'
import serveWebApp from './serve-web-app'

import type {ErrBack} from '../types'

const SERVE_COMMANDS = {
  [INFERNO_APP]: serveInfernoApp,
  [PREACT_APP]: servePreactApp,
  [REACT_APP]: serveReactApp,
  [REACT_COMPONENT]: serveReactDemo,
  [WEB_APP]: serveWebApp,
}

/**
 * Generic serve command, invokes the appropriate project type-specific command.
 */
export default function serve(args: Object, cb: ErrBack) {
  let projectType
  try {
    projectType = getProjectType(args)
  }
  catch (e) {
    return cb(e)
  }

  if (!SERVE_COMMANDS[projectType]) {
    return cb(new UserError(`Unable to serve anything for a ${projectType} project.`))
  }

  SERVE_COMMANDS[projectType](args, cb)
}
