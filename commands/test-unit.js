var path = require('path')
var exec = require('../exec')

var config = path.join(__dirname, '../karma.conf.js')

exec(
  'karma',
  ['start', config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
