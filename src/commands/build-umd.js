import path from 'path'
import exec from '../exec'

let config = path.join(__dirname, '../config/webpack-umd.js')
let cwd = process.cwd()

console.log('nwb: build-umd')
exec(
  'webpack',
  [`--config=${config}`, `--set-env-ORIGINAL_CWD=${cwd}`],
  {cwd: path.join(__dirname, '../../')
})
exec(
  'webpack',
  [`--config=${config}`, `--set-env-ORIGINAL_CWD=${cwd}`, '--set-env-NODE_ENV=production'],
  {cwd: path.join(__dirname, '../../')
})
