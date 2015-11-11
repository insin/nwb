var path = require('path')
var exec = require('../exec')

var rimraf = path.resolve(__dirname, '../node_modules/.bin/rimraf')

console.log('npb: clean')
exec([rimraf, 'demo/dist'])
