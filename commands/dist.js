var glob = require('glob')

// Prepare a web module for distribution
require('./clean-module')
require('./build-module')
require('./build-umd')

// If the module has a demo, bundle it for deployment
if (glob.sync('demo/').length > 0) {
  require('./dist-demo')
}
