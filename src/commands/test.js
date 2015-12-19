import path from 'path'

import karmaServer from '../karmaServer'

export default function(args, cb) {
  let cwd = process.cwd()
  let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'

  // We need to be in nwb's dir so Karma can import plugins
  process.chdir(path.join(__dirname, '../../'))

  console.log('nwb: test')
  karmaServer({
    cwd,
    singleRun: !args.server,
    runCoverage: isCi || !!args.coverage
  }, cb)
}
