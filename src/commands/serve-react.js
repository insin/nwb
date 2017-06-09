// @flow
import {serve} from '../quickCommands'
import reactConfig from '../react'

import type {ErrBack} from '../types'

/**
 * Serve a standalone React app entry module, component or element.
 */
export default function serveReact(args: Object, cb: ErrBack) {
  serve(args, reactConfig(args), cb)
}
