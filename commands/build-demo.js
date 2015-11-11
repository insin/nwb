var path = require('path')
var exec = require('../exec')

var webpack = path.join(__dirname, '../node_modules/.bin/webpack')
var config = path.join(__dirname, '../webpack.demo.config.js')

console.log('npb: build-demo')
exec(
  [webpack, '--config=' + config, '--set-env-ORIGINAL_CWD=' + process.cwd()],
  {cwd: path.join(__dirname, '..')
})
