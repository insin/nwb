import fs from 'fs'
import path from 'path'

import glob from 'glob'
import temp from 'temp'

import cleanModule from './commands/clean-module'
import {REACT_COMPONENT} from './constants'
import createBabelConfig from './createBabelConfig'
import exec from './exec'
import {UserError} from './errors'
import getUserConfig from './getUserConfig'

/**
 * Runs Babel with generated config written to a temporary .babelrc.
 */
function runBabel(src, outDir, buildBabelConfig, userBabelConfig) {
  let babelConfig = createBabelConfig(buildBabelConfig, userBabelConfig)
  fs.writeFileSync('.babelrc', JSON.stringify(babelConfig, null, 2))
  try {
    exec('babel', [src, '--out-dir', outDir])
  }
  finally {
    fs.unlinkSync('.babelrc')
  }
}

export default function moduleBuild(args) {
  // XXX Babel doesn't support passing the path to a babelrc file any more
  if (glob.sync('.babelrc').length > 0) {
    throw new UserError(
      'nwb: Unable to build the module as there is a .babelrc in your project',
      'nwb: I need to write a temporary .babelrc to configure the build',
    )
  }

  cleanModule(args)

  let src = path.resolve('src')
  let userConfig = getUserConfig(args)

  let babelConfig = {}
  if (userConfig.type === REACT_COMPONENT) {
    babelConfig.presets = ['react']
  }

  console.log('nwb: build-module (es5)')
  runBabel(src, path.resolve('lib'), {
    ...babelConfig,
    plugins: [require.resolve('babel-plugin-add-module-exports')],
  }, userConfig.babel)

  if (userConfig.npm.nativeModules) {
    console.log('nwb: build-module (es6 modules)')
    runBabel(src, path.resolve('es6'), {...babelConfig, nativeModules: true}, userConfig.babel)
  }

  temp.cleanupSync()
}
