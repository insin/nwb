// @flow
import {build} from '../quickCommands'
import reactConfig from '../react'

import type {ErrBack} from '../types'

/**
 * Build a standalone React app entry module, component or element.
 */
export default function buildReact(args: Object, cb: ErrBack) {
  build(args, reactConfig(args), cb)
}
