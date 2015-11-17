var glob = require('glob')

require('./clean-module')
require('./build-module')
require('./build-umd')

if (glob.sync('demo').length > 0) {
  require('./dist-demo')
}
