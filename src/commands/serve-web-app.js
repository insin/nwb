// @flow
import webConfig from '../web'
import {serve} from '../appCommands'

import type {ErrBack} from '../types'

/**
 * Serve a plain JS app.
 */
export default function serveWebApp(args: Object, cb: ErrBack) {
  serve(args, webConfig(args), cb)
}
