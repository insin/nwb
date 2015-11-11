var path = require('path')
var exec = require('../exec')

var eslint = path.join(__dirname, '../node_modules/.bin/eslint')
var config = path.join(__dirname, '../.eslintrc')
var src = path.resolve('demo/src')

console.log('npb: lint-demo')
exec([eslint, '-c', config, src], {cwd: path.join(__dirname, '..')})
