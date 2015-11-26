import getUserConfig from '../getUserConfig'

export default function(args) {
  var userConfig = getUserConfig()
  if (userConfig.type === 'react-app') {
    require('./serve-react-app')(args)
  }
  else {
    console.log('serve: unable to serve anything in the current directory')
    process.exit(1)
  }
}
