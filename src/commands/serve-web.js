// @flow
import {serve} from '../quickCommands'
import webConfig from '../web'

import type {ErrBack} from '../types'

/**
 * Serve a standalone vanilla JavaScript app.
 */
export default function serveWeb(args: Object, cb: ErrBack) {
  serve(args, webConfig(args), cb)
}
