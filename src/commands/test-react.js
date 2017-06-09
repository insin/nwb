// @flow
import karmaServer from '../karmaServer'
import reactConfig from '../react'

import type {ErrBack} from '../types'

export default function testReact(args: Object, cb: ErrBack) {
  karmaServer(args, reactConfig(args).getKarmaTestConfig(), cb)
}
