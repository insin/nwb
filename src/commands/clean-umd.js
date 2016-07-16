import exec from '../exec'

export default function cleanUMD(args) {
  console.log('nwb: clean-umd')
  exec('rimraf', ['umd'])
}
