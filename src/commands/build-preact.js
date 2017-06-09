// @flow
import preactConfig from '../preact'
import {build} from '../quickCommands'

import type {ErrBack} from '../types'

/**
 * Build a standalone Preact entry module, component or element.
 */
export default function buildPreact(args: Object, cb: ErrBack) {
  build(args, preactConfig(args), cb)
}
