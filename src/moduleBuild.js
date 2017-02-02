import fs from 'fs'
import path from 'path'

import spawn from 'cross-spawn'
import ora from 'ora'
import runSeries from 'run-series'
import merge from 'webpack-merge'

import cleanModule from './commands/clean-module'
import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {UserError} from './errors'
import getUserConfig from './getUserConfig'
import {deepToString} from './utils'
import webpackBuild from './webpackBuild'
import {createBanner, createExternals, logGzippedFileSizes} from './webpackUtils'

// These match DEFAULT_TEST_DIRS and DEFAULT_TEST_FILES for co-located tests in
// ./createKarmaConfig.js; unfortunately Babel doesn't seem to support reusing
// the same patterns.
const DEFAULT_BABEL_IGNORE_CONFIG = [
  '.spec.js',
  '.test.js',
  '-test.js',
  '/__tests__/'
]

/**
 * Run Babel with generated config written to a temporary .babelrc.
 */
function runBabel(name, {copyFiles, outDir, src}, buildBabelConfig, userBabelConfig, cb) {
  let babelConfig = createBabelConfig(buildBabelConfig, userBabelConfig)
  babelConfig.ignore = DEFAULT_BABEL_IGNORE_CONFIG

  debug('babel config: %s', deepToString(babelConfig))

  let args = [src, '--out-dir', outDir, '--quiet']
  if (copyFiles) {
    args.push('--copy-files')
  }

  fs.writeFile('.babelrc', JSON.stringify(babelConfig, null, 2), (err) => {
    if (err) return cb(err)
    let spinner = ora(`Creating ${name} build`).start()
    let babel = spawn(require.resolve('.bin/babel'), args, {stdio: 'inherit'})
    babel.on('exit', (code) => {
      let babelError
      if (code !== 0) {
        spinner.fail()
        babelError = new Error('Babel transpilation failed')
      }
      else {
        spinner.succeed()
      }
      fs.unlink('.babelrc', (unlinkError) => {
        cb(babelError || unlinkError)
      })
    })
  })
}

/**
 * Create development and production UMD builds for <script> tag usage.
 */
function buildUMD(args, buildConfig, userConfig, cb) {
  let spinner = ora('Creating UMD builds').start()

  let pkg = require(path.resolve('package.json'))
  let entry = path.resolve(args._[1] || 'src/index.js')
  let webpackBuildConfig = {
    babel: buildConfig.babel,
    entry: [entry],
    output: {
      filename: `${pkg.name}.js`,
      library: userConfig.npm.umd.global,
      libraryTarget: 'umd',
      path: path.resolve('umd'),
    },
    externals: createExternals(userConfig.npm.umd.externals),
    polyfill: false,
    plugins: {
      banner: createBanner(pkg),
    },
  }

  process.env.NODE_ENV = 'development'
  webpackBuild(null, args, webpackBuildConfig, (err, stats1) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    process.env.NODE_ENV = 'production'
    webpackBuildConfig.babel = merge(buildConfig.babel, buildConfig.babelProd || {})
    webpackBuildConfig.devtool = 'source-map'
    webpackBuildConfig.output.filename = `${pkg.name}.min.js`
    webpackBuild(null, args, webpackBuildConfig, (err, stats2) => {
      if (err) {
        spinner.fail()
        return cb(err)
      }
      spinner.succeed()
      console.log()
      logGzippedFileSizes(stats1, stats2)
      cb()
    })
  })
}

export default function moduleBuild(args, buildConfig = {}, cb) {
  // XXX Babel doesn't support passing the path to a babelrc file any more
  if (fs.existsSync('.babelrc')) {
    throw new UserError(
      'Unable to build the module as there is a .babelrc in your project',
      'nwb needs to write a temporary .babelrc to configure the build',
    )
  }

  let src = path.resolve('src')
  let userConfig = getUserConfig(args)
  let copyFiles = !!args['copy-files']

  let tasks = [
    (cb) => cleanModule(args, cb),
    (cb) => runBabel(
      'ES5',
      {copyFiles, outDir: path.resolve('lib'), src},
      merge(buildConfig.babel, buildConfig.babelDev || {}, {
        // Don't force ES5 users of the ES5 build to eat a .require
        commonJSInterop: true,
        // Transpile modules to CommonJS for ES5 users
        modules: 'commonjs',
        // Don't set the path to nwb's babel-runtime, as it will need to be a
        // peerDependency of your module if you use transform-runtime's helpers
        // option.
        setRuntimePath: false,
        // Don't enable webpack-specific plugins
        webpack: false,
      }),
      userConfig.babel,
      cb
    )
  ]

  // The ES6 modules build is enabled by default, and must be explicitly
  // disabled if you don't want it.
  if (userConfig.npm.esModules !== false) {
    tasks.push((cb) => runBabel(
      'ES6 modules',
      {copyFiles, outDir: path.resolve('es'), src},
      merge(buildConfig.babel, buildConfig.babelDev || {}, {
        // Don't set the path to nwb's babel-runtime, as it will need to be a
        // peerDependency of your module if you use transform-runtime's helpers
        // option.
        setRuntimePath: false,
        // Don't enable webpack-specific plugins
        webpack: false,
      }),
      userConfig.babel,
      cb
    ))
  }

  // The UMD build must be explicitly enabled
  if (userConfig.npm.umd) {
    tasks.push((cb) => buildUMD(args, buildConfig, userConfig, cb))
  }

  runSeries(tasks, cb)
}
