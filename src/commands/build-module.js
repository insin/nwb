import fs from 'fs'
import path from 'path'

import temp from 'temp'

import debug from '../debug'
import exec from '../exec'
import getUserConfig from '../getUserConfig'

function preset(presetName) {
  return require.resolve(`babel-preset-${presetName}`)
}

function presets(...presetNames) {
  return presetNames.map(preset).join(',')
}

export default function(args) {
  require('./clean-module').default(args)

  let cwd = path.join(__dirname, '..')
  let es6 = path.resolve('es6')
  let lib = path.resolve('lib')
  let src = path.resolve('src')

  let userConfig = getUserConfig(args)
  let {stage, ...babelConfig} = userConfig.babel
  let babelArgs = [src, '--out-dir', lib, '--presets', presets('es2015', 'react', `stage-${stage}`)]

  if (Object.keys(babelConfig).length > 0) {
    var babelrc = temp.openSync()
    debug('writing babelrc to %s', babelrc.path)
    fs.writeSync(babelrc.fd, JSON.stringify(babelConfig))
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
