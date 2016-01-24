import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'

export default function(args, testConfig, cb) {
  let karmaConfig = createKarmaConfig(args, testConfig)

  new Server(karmaConfig, cb).start()
}
