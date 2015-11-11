var fs = require('fs')
var path = require('path')

require('./lint')
require('./clean')
require('./build')
require('./build-umd')

try {
  fs.statSync(path.resolve('demo'))
  require('./dist-demo')
}
catch (e) {
  // pass
}
