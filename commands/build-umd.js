var path = require('path')
var exec = require('../exec')

var config = path.join(__dirname, '../webpack.config.js')

console.log('nwb: build-umd')
exec(
  'webpack',
  ['--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
exec(
  'webpack',
  ['--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd(), '--set-env-NODE_ENV=production'],
  {cwd: path.join(__dirname, '..')
})
