// @flow
import karmaServer from '../karmaServer'

import type {ErrBack} from '../types'

export default function testWebModule(args: Object, cb: ErrBack) {
  karmaServer(args, {}, cb)
}
