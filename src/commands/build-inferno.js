// @flow
import infernoConfig from '../inferno'
import {build} from '../quickCommands'

import type {ErrBack} from '../types'

/**
 * Build a standalone Inferno app entry module, component or VNode.
 */
export default function buildInferno(args: Object, cb: ErrBack) {
  build(args, infernoConfig(args), cb)
}
