var glob = require('glob')

if (glob.sync('public').length > 0) {
  require('./clean-app')
}
else {
  require('./clean-module')
}
