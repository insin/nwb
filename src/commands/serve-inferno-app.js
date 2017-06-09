// @flow
import infernoConfig from '../inferno'
import {serve} from '../appCommands'

import type {ErrBack} from '../types'

/**
 * Serve an Inferno app.
 */
export default function serveInferno(args: Object, cb: ErrBack) {
  serve(args, infernoConfig(args), cb)
}
