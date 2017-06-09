// @flow
import infernoConfig from '../inferno'
import {serve} from '../quickCommands'

import type {ErrBack} from '../types'

/**
 * Build a standalone Inferno app entry module, component or VNode.
 */
export default function serveInferno(args: Object, cb: ErrBack) {
  serve(args, infernoConfig(args), cb)
}
