import exec from '../exec'

export default function cleanDemo(args) {
  console.log('nwb: clean-demo')
  exec('rimraf', ['demo/dist'])
}
