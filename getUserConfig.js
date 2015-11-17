var path = require('path')

module.exports = function getUserConfig(command, userConfigFile) {
  // Try to load default user config, or user config file we were given
  var userConfig = {}
  try {
    userConfig = require(path.join(process.cwd(), userConfigFile || 'nwb.' + command + '.config.js'))
  }
  catch (e) {
    if (userConfigFile) {
      console.error('specified ' + command + ' config file not found: ' + userConfigFile)
      process.exit(1)
    }
  }
  if (typeof userConfig === 'function') {
    userConfig = userConfig()
  }
  return userConfig
}
