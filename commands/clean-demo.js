var path = require('path')
var exec = require('../exec')

var rimraf = path.resolve(__dirname, '../node_modules/.bin/rimraf')

console.log('nwb: clean')
exec([rimraf, 'demo/dist'])
