import exec from '../exec'

console.log('nwb: clean-app')
exec('rimraf', ['public/build'])
