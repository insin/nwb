var path = require('path')
var exec = require('../exec')

var babel = path.join(__dirname, '../node_modules/.bin/babel')
var src = path.resolve('src')
var lib = path.resolve('lib')

console.log('nwb: build')
exec([babel, src, '--out-dir', lib], {cwd: path.join(__dirname, '..')})
