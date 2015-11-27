import glob from 'glob'

// Prepare a web module for distribution
require('./build-module')
require('./build-umd')

// If the module has a demo, bundle it for deployment
if (glob.sync('demo/').length > 0) {
  require('./dist-demo')
}
