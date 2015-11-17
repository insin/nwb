var glob = require('glob')

module.export = function(args) {
  if (glob.sync('public/').length > 0) {
    require('./clean-app')
    require('./build-app')(args)
  }
  else {
    require('./build-module')
  }
}

