import exec from '../exec'

export default function(args) {
  console.log('nwb: clean-module')
  exec('rimraf', ['coverage', 'es6', 'lib'])
}
