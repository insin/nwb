var path = require('path')
var exec = require('../exec')

var config = path.join(__dirname, '../.eslintrc')
var src = path.resolve('demo/src')

console.log('nwb: lint-demo')
exec(
  'eslint',
  ['-c', config, src],
  {cwd: path.join(__dirname, '..')}
)
