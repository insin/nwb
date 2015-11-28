import path from 'path'

import debug from '../debug'
import exec from '../exec'

export default function(args) {
  let config = path.join(__dirname, '../config/karma.js')
  let cwd = process.cwd()
  let karmaArgs = ['start', config, `--set-env-ORIGINAL_CWD=${cwd}`]
  if (!args.server) {
    karmaArgs.push('--single-run')
  }
  if (args.coverage) {
    karmaArgs.push('--set-env-COVERAGE=true')
  }

  console.log('nwb: test')
  try {
    exec('karma', karmaArgs, {
      cwd: path.resolve(__dirname, '../../')
    })
  }
  catch (e) {
    debug(e.stack)
    process.exit(1)
  }
}
