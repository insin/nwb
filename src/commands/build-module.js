import fs from 'fs'
import path from 'path'

import temp from 'temp'

import debug from '../debug'
import exec from '../exec'
import getUserConfig from '../getUserConfig'

export default function(args) {
  require('./clean-module')(args)

  let cwd = path.join(__dirname, '..')
  let es6 = path.resolve('es6')
  let lib = path.resolve('lib')
  let src = path.resolve('src')

  let babelArgs = [src, '--out-dir', lib]

  // Write any user babel config to a temporary file to point babel at via the
  // babelrc option.
  let userConfig = getUserConfig(args)
  if (userConfig.babel) {
    var babelrc = temp.openSync()
    debug('writing babelrc to %s', babelrc.path)
    fs.writeSync(babelrc.fd, JSON.stringify(userConfig.babel))
    fs.closeSync(babelrc.fd)
    babelArgs = [...babelArgs, '--babelrc', babelrc.path]
  }

  console.log('nwb: build-module (es5)')
  exec('babel', babelArgs, {cwd})

  if (userConfig.jsNext) {
    babelArgs[2] = es6
    babelArgs = [...babelArgs, '--blacklist=es6.modules']
    console.log('nwb: build-module (es6)')
    exec('babel', babelArgs, {cwd})
  }

  temp.cleanupSync()
}
