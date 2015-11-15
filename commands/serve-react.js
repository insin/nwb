var path = require('path')

var config = require('../webpack.react-hot.config')
var devServer = require('../dev-server')

module.exports = function(args) {
  if (!args._[1]) {
    console.error(args._[0] + ': the path to an entry module must be provided')
    process.exit(1)
  }

  var cwd = process.cwd()
  var entry = path.resolve(args._[1])

  // Make nwb/ the working directory so Babel can resolve its plugins
  process.chdir(path.join(__dirname, '..'))

  devServer(
    config({
      cwd: cwd,
      entry: entry,
      port: 3000
    }),
    {port: 3000}
  )
}
