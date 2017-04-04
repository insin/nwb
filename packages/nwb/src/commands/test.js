import {INFERNO_APP, PREACT_APP, REACT_APP, REACT_COMPONENT} from '../constants'
import getUserConfig from '../getUserConfig'
import karmaServer from '../karmaServer'
import testInferno from './test-inferno'
import testPreact from './test-preact'
import testReact from './test-react'

const TEST_COMMANDS = {
  [INFERNO_APP]: testInferno,
  [PREACT_APP]: testPreact,
  [REACT_APP]: testReact,
  [REACT_COMPONENT]: testReact,
}

/**
 * Generic test command, invokes the appropriate project type-specific command,
 * or runs with the default test config.
 */
export default function test(args, cb) {
  let userConfig = getUserConfig(args)
  if (userConfig.type && TEST_COMMANDS[userConfig.type]) {
    TEST_COMMANDS[userConfig.type](args, cb)
  }
  else {
    karmaServer(args, {}, cb)
  }
}
