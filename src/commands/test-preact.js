// @flow
import karmaServer from '../karmaServer'
import preactConfig from '../preact'

import type {ErrBack} from '../types'

export default function testPreact(args: Object, cb: ErrBack) {
  karmaServer(args, preactConfig(args).getKarmaTestConfig(), cb)
}
