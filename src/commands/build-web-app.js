// @flow
import {build} from '../appCommands'
import webConfig from '../web'

import type {ErrBack} from '../types'

/**
 * Build a plain JS app.
 */
export default function buildWebApp(args: Object, cb: ErrBack) {
  build(args, webConfig(args), cb)
}
