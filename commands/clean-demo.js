var exec = require('../exec')

console.log('nwb: clean')
exec('rimraf' ['demo/dist'])
