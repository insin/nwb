// @flow
import {build} from '../quickCommands'
import webConfig from '../web'

import type {ErrBack} from '../types'

/**
 * Build a vanilla JavaScript app.
 */
export default function buildWE(args: Object, cb: ErrBack) {
  build(args, webConfig(args), cb)
}
