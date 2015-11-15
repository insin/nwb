module.exports = function(args) {
  args._[1] = 'src/index.js'
  require('./serve-react')(args)
}
