import glob from 'glob'

import getUserConfig from '../getUserConfig'

export default function(args) {
  var userConfig = getUserConfig()
  if (userConfig.type === 'react-app') {
    require('./clean-app')
    require('./build-react-app')(args)
  }
  else if (glob.sync('public/').length > 0) {
    require('./clean-app')
    require('./build-app')(args)
  }
  else {
    require('./build-module')
  }
}
