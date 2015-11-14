var exec = require('../exec')

console.log('nwb: clean-module')
exec('rimraf', ['lib', 'umd'])
