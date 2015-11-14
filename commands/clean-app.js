var exec = require('../exec')

console.log('nwb: clean-app')
exec('rimraf', ['public/build'])
