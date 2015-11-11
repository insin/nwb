var path = require('path')
var exec = require('../exec')

var karma = path.join(__dirname, '../node_modules/.bin/karma')
var config = path.join(__dirname, '../karma.conf.js')

exec(
  [karma, 'start', config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
