import path from 'path'
import exec from '../exec'

let config = path.join(__dirname, '../config/webpack-build.js')

console.log('nwb: build-demo')
exec(
  'webpack',
  ['--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
