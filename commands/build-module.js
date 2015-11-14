var path = require('path')
var exec = require('../exec')

var src = path.resolve('src')
var lib = path.resolve('lib')

console.log('nwb: build-module')
exec(
  'babel',
  [src, '--out-dir', lib],
  {cwd: path.join(__dirname, '..')}
)
