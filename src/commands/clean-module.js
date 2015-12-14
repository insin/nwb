import exec from '../exec'

export default function(args) {
  console.log('nwb: clean-module')
  exec('rimraf', ['es6', 'lib'])
}
