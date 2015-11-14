var exec = require('../exec')

console.log('nwb: clean-demo')
exec('rimraf', ['demo/dist'])
