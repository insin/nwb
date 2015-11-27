import path from 'path'
import exec from '../exec'

export default function(args) {
  let config = path.join(__dirname, '../config/karma.js')
  let cwd = process.cwd()
  let karmaArgs = ['start', config, `--set-env-ORIGINAL_CWD=${cwd}`]
  if (!args.server) {
    karmaArgs.push('--single-run')
  }

  console.log('nwb: test')
  exec('karma', karmaArgs, {
    cwd: path.resolve(__dirname, '../../')
  })
}
