import path from 'path'
import exec from '../exec'

export default function(args) {
  let config = path.join(__dirname, '../config/karma.js')
  let cwd = process.cwd()

  console.log('nwb: test')
  exec(
    'karma',
    ['start', config, `--set-env-ORIGINAL_CWD=${cwd}`],
    {cwd: path.resolve(__dirname, '../..')}
  )
}
