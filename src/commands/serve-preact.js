// @flow
import preactConfig from '../preact'
import {serve} from '../quickCommands'

import type {ErrBack} from '../types'

/**
 * Build a standalone Preact app entry module, component or element.
 */
export default function servePreact(args: Object, cb: ErrBack) {
  serve(args, preactConfig(args), cb)
}
