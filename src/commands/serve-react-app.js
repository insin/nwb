// @flow
import {serve} from '../appCommands'
import reactConfig from '../react'

import type {ErrBack} from '../types'

/**
 * Serve a React app.
 */
export default function serveReact(args: Object, cb: ErrBack) {
  serve(args, reactConfig(args), cb)
}
