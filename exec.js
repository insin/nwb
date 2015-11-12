var execSync = require('child_process').execSync
var path = require('path')

var glob = require('glob')

/**
 * Get the absolute path to a named .bin script in a manner compatible with
 * global installs and both npm@2 and npm@3 local installs.
 */
function getBinScript(name) {
  // Global install or npm@2 local install, dependencies in local node_modules
  var paths = glob.sync('./node_modules/.bin/' + name, {cwd: __dirname})
  if (paths.length > 0) return path.join(__dirname, paths[0])
  // Local npm@3 install, .bin and dependencies are siblings
  paths = glob.sync('../.bin/' + name, {cwd: __dirname})
  if (paths.length > 0) return path.join(__dirname, paths[0])
  throw new Error('Unable to find .bin script for ' + name)
}

/**
 * Synchronously call a .bin script with the given args using the given execSync
 * options.
 */
module.exports = function exec(bin, args, options) {
  options = options || {}
  options.stdio = [0, 1, 2]
  var command = getBinScript(bin) + ' ' + args.join(' ')
  console.log('nwb: ' + bin + ' ' + args.join(' '))
  console.log('')
  execSync(command, options)
}
