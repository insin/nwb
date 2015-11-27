import {REACT_APP, REACT_COMPONENT} from '../constants'
import getUserConfig from '../getUserConfig'

export default function(args) {
  let userConfig = getUserConfig(args)
  if (userConfig.type === REACT_APP) {
    require('./serve-react-app')(args)
  }
  else if (userConfig.type === REACT_COMPONENT) {
    require('./serve-react-demo')(args)
  }
  else {
    console.log('nwb: unable to serve anything in the current module')
    process.exit(1)
  }
}
