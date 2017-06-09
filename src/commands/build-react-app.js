// @flow
import {build} from '../appCommands'
import reactConfig from '../react'

import type {ErrBack} from '../types'

/**
 * Build a React app.
 */
export default function buildReactApp(args: Object, cb: ErrBack) {
  build(args, reactConfig(args), cb)
}
