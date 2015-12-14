import exec from '../exec'

export default function(args) {
  console.log('nwb: clean-demo')
  exec('rimraf', ['demo/dist'])
}
