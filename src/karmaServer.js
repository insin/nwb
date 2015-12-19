import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'

export default function(testConfig, cb) {
  let karmaConfig = createKarmaConfig(testConfig)

  new Server(karmaConfig, cb).start()
}
