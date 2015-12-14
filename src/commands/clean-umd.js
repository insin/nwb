import exec from '../exec'

export default function(args) {
  console.log('nwb: clean-umd')
  exec('rimraf', ['umd'])
}
