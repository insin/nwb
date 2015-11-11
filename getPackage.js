var path = require('path')

function validatePackage(pkg) {
  var requiredFields = ['name', 'version', 'homepage', 'license', 'global']
  var missing = requiredFields.reduce(function(missing, field) {
    if (!pkg[field]) {
      missing.push(field)
    }
    return missing
  }, [])
  if (missing.length > 0) {
    console.error('required fields are missing from package.json: ' + missing.join(', '))
    process.exit(1)
  }

  if (pkg.externals && Object.prototype.toString.call(pkg.externals) !== '[object Object]') {
    console.error('package.json "externals" must be an Object')
    process.exit(1)
  }
}

module.exports = function getPackage(cwd) {
  var pkg = require(path.join(cwd, 'package.json'))
  if (!pkg) {
    console.error('package.json not found in the current directory')
    process.exit(1)
  }

  validatePackage(pkg)

  // Expand a {package: global} object into a webpack externals object
  if (pkg.externals) {
    pkg.externals = Object.keys(pkg.externals).reduce(function(externals, packageName) {
      var globalName = pkg.externals[packageName]
      externals[packageName] = {
        root: globalName,
        commonjs2: packageName,
        commonjs: packageName,
        amd: packageName
      }
      return externals
    }, {})
  }
  else {
    pkg.externals = {}
  }

  return pkg
}
