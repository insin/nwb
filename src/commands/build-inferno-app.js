// @flow
import {build} from '../appCommands'
import infernoConfig from '../inferno'

import type {ErrBack} from '../types'

/**
 * Build an Inferno app.
 */
export default function buildPreactApp(args: Object, cb: ErrBack) {
  build(args, infernoConfig(args), cb)
}
