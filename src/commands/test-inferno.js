// @flow
import infernoConfig from '../inferno'
import karmaServer from '../karmaServer'

import type {ErrBack} from '../types'

export default function testInferno(args: Object, cb: ErrBack) {
  karmaServer(args, infernoConfig(args).getKarmaTestConfig(), cb)
}
