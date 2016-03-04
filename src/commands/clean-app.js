import exec from '../exec'

export default function(args) {
  console.log('nwb: clean-app')
  exec('rimraf', ['coverage', 'dist'])
}
