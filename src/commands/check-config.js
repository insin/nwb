import getUserConfig, {UserConfigReport} from '../getUserConfig'

function getFullEnv(env) {
  if (env === 'dev') return 'development'
  if (env === 'prod') return 'production'
  return env
}

export default function checkConfig(args) {
  if (args.e || args.env) {
    process.env.NODE_ENV = getFullEnv(args.e || args.env)
  }
  try {
    getUserConfig(
      {_: [args.command || 'check-config'], config: args._[1]},
      {check: true, required: !!args._[1]}
    )
  }
  catch (report) {
    if (!(report instanceof UserConfigReport)) throw report
    report.log()
  }
}
