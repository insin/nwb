// @flow
import preactConfig from '../preact'
import {serve} from '../appCommands'

import type {ErrBack} from '../types'

/**
 * Serve a Preact app.
 */
export default function servePreact(args: Object, cb: ErrBack) {
  serve(args, preactConfig(args), cb)
}
