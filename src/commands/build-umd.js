import assert from 'assert'
import path from 'path'

import getUserConfig from '../getUserConfig'
import webpackBuild from '../webpackBuild'

function createBanner(pkg) {
  let banner = `${pkg.name} ${pkg.version}`
  if (pkg.homepage) {
    banner += ` - ${pkg.homepage}`
  }
  if (pkg.license) {
    banner += `\n${pkg.license} Licensed`
  }
  return banner
}

function createWebpackExternals(externals) {
  return Object.keys(externals).reduce((webpackExternals, packageName) => {
    let globalName = externals[packageName]
    webpackExternals[packageName] = {
      root: globalName,
      commonjs2: packageName,
      commonjs: packageName,
      amd: packageName
    }
    return webpackExternals
  }, {})
}

/**
 * Create a web module's UMD builds.
 */
export default function(args, cb) {
  let pkg = require(path.resolve('package.json'))
  let userConfig = getUserConfig(args)

  if (!userConfig.umd) {
    console.error(`nwb: the UMD build for this module is disabled by nwb.config.js (umd = ${userConfig.umd})`)
    process.exit(1)
  }

  assert(userConfig.global, 'global config is required to create a UMD build')

  let buildConfig = {
    entry: path.resolve('src/index.js'),
    output: {
      filename: `${pkg.name}.js`,
      library: userConfig.global,
      libraryTarget: 'umd',
      path: path.resolve('umd')
    },
    externals: createWebpackExternals(userConfig.externals),
    plugins: {
      banner: createBanner(pkg)
    }
  }

  require('./clean-umd')(args)

  console.log('nwb: build-umd')
  process.env.NODE_ENV = 'development'
  webpackBuild(args, buildConfig, () => {
    process.env.NODE_ENV = 'production'
    buildConfig.devtool = 'source-map'
    buildConfig.output.filename = `${pkg.name}.min.js`
    webpackBuild(args, buildConfig, cb)
  })
}
