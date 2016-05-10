import {Server} from 'karma'

import createKarmaConfig from './createKarmaConfig'
import getUserConfig from './getUserConfig'

export default function(args, testConfig, cb) {
  let userConfig = getUserConfig(args)
  let karmaConfig = createKarmaConfig(testConfig, userConfig)

  new Server(karmaConfig, cb).start()
}
