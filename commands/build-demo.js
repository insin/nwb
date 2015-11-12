var path = require('path')
var exec = require('../exec')

var config = path.join(__dirname, '../webpack.demo.config.js')

console.log('nwb: build-demo')
exec(
  'webpack',
  ['--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
