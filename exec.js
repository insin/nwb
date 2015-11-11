var execSync = require('child_process').execSync

module.exports = function exec(args, options) {
  options = options || {}
  options.stdio = [0, 1, 2]
  var command = args.join(' ')
  console.log('npb: ' + args[0].split(/[\\/]/).pop() + ' ' + args.slice(1).join(' '))
  console.log('')
  execSync(command, options)
}
