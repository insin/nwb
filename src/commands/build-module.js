import path from 'path'
import exec from '../exec'

require('./clean-module')

let src = path.resolve('src')
let lib = path.resolve('lib')

console.log('nwb: build-module')
exec(
  'babel',
  [src, '--out-dir', lib],
  {cwd: path.join(__dirname, '..')}
)
