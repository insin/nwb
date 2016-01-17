import karmaServer from '../karmaServer'

export default function(args, cb) {
  let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'

  console.log('nwb: test')
  karmaServer({
    codeCoverage: isCi || !!args.coverage,
    singleRun: isCi || !args.server
  }, cb)
}
