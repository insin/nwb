import exec from '../exec'

export default function(args) {
  let dist = args._[1] || 'dist'

  console.log('nwb: clean-app')
  exec('rimraf', ['coverage', dist])
}
