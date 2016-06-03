import path from 'path'

import getUserConfig from '../getUserConfig'
import {UserError} from '../errors'
import {createBanner, createWebpackExternals} from '../utils'
import webpackBuild from '../webpackBuild'

/**
 * Create a web module's UMD builds.
 */
export default function(args, cb) {
  let pkg = require(path.resolve('package.json'))
  let {build} = getUserConfig(args)

  if (!build.umd) {
    return cb(new UserError(
      "nwb: the UMD build for this module hasn't been enabled in nwb.config.js"
    ))
  }

  let entry = args._[1] || 'src/index.js'
  let buildConfig = {
    entry: path.resolve(entry),
    output: {
      filename: `${pkg.name}.js`,
      library: build.global,
      libraryTarget: 'umd',
      path: path.resolve('umd')
    },
    externals: createWebpackExternals(build.externals),
    plugins: {
      banner: createBanner(pkg)
    }
  }

  require('./clean-umd')(args)

  console.log('nwb: build-umd')
  process.env.NODE_ENV = 'development'
  webpackBuild(args, buildConfig, err => {
    if (err) return cb(err)
    process.env.NODE_ENV = 'production'
    buildConfig.devtool = 'source-map'
    buildConfig.output.filename = `${pkg.name}.min.js`
    webpackBuild(args, buildConfig, cb)
  })
}
