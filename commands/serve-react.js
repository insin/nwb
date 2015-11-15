var path = require('path')

var resolve = require('resolve')

var config = require('../webpack.react-hot.config')
var devServer = require('../dev-server')

module.exports = function(args) {
  if (!args._[1]) {
    console.error(args._[0] + ': the path to an entry module must be provided')
    process.exit(1)
  }

  var cwd = process.cwd()
  var entry = path.resolve(args._[1])
  // Find the version of React local to the entry module being served - this is
  // the only one we want to load.
  var react = resolve.sync('react', {basedir: cwd})

  devServer(
    config({
      cwd: cwd,
      entry: entry,
      port: 3000,
      react: react
    }),
    {port: 3000}
  )
}
