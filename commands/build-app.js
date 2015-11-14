var path = require('path')
var exec = require('../exec')

var config = path.join(__dirname, '../webpack.app.config.js')

console.log('nwb: build-app')
exec(
  'webpack',
  ['--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd(), '--set-env-NODE_ENV=production'],
  {cwd: path.join(__dirname, '..')
})
