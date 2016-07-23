import path from 'path'

import cleanModule from './commands/clean-module'
import createBabelConfig from './createBabelConfig'
import exec from './exec'
import getUserConfig from './getUserConfig'

function getBabelArgs(babelConfig) {
  let args = ['--no-babelrc']
  if (babelConfig.presets) {
    args.push('--presets', babelConfig.presets.join(','))
  }
  if (babelConfig.plugins) {
    args.push('--plugins', babelConfig.plugins.join(','))
  }
  return args
}

export default function moduleBuild(args, {presets} = {}) {
  cleanModule(args)

  let src = path.resolve('src')
  let userConfig = getUserConfig(args)

  console.log('nwb: build-module (es5)')
  exec('babel', [
    src,
    '--out-dir', path.resolve('lib'),
    ...getBabelArgs(createBabelConfig({presets}, userConfig.babel)),
  ])

  if (userConfig.npm.jsNext) {
    console.log('nwb: build-module (es6 modules)')
    exec('babel', [
      src,
      '--out-dir', path.resolve('es6'),
      ...getBabelArgs(createBabelConfig({native: true, presets}, userConfig.babel)),
    ])
  }
}
