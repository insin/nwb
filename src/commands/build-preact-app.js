// @flow
import {build} from '../appCommands'
import preactConfig from '../preact'

import type {ErrBack} from '../types'

/**
 * Build a Preact app.
 */
export default function buildPreactApp(args: Object, cb: ErrBack) {
  build(args, preactConfig(args), cb)
}
