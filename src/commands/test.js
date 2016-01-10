import karmaServer from '../karmaServer'

export default function(args, cb) {
  let cwd = process.cwd()
  let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'

  console.log('nwb: test')
  karmaServer({
    cwd,
    singleRun: !args.server,
    runCoverage: isCi || !!args.coverage
  }, cb)
}
