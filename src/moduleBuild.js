import fs from 'fs'
import path from 'path'

import glob from 'glob'
import temp from 'temp'

import cleanModule from './commands/clean-module'
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

export default function moduleBuild(args, babelConfig) {
  if (glob.sync('.babelrc').length > 0) {
    throw new UserError(
      'nwb: Unable to create a module build as there is a .babelrc in your project',
      'nwb: I need to write a temporary .babelrc to configure the build',
    )
  }

  cleanModule(args)

  let src = path.resolve('src')
  let userConfig = getUserConfig(args)

  console.log('nwb: build-module (es5)')
  runBabel(src, path.resolve('lib'), babelConfig, userConfig.babel)

  if (userConfig.npm.jsNext) {
    console.log('nwb: build-module (es6 modules)')
    runBabel(src, path.resolve('es6'), {...babelConfig, native: true}, userConfig.babel)
  }

  temp.cleanupSync()
}
