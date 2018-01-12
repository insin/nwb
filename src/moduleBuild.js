import fs from 'fs'
import path from 'path'

import spawn from 'cross-spawn'
import ora from 'ora'
import runSeries from 'run-series'
import merge from 'webpack-merge'

import cleanModule from './commands/clean-module'
import {getPluginConfig, getUserConfig} from './config'
import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {UserError} from './errors'
import {deepToString} from './utils'
import webpackBuild from './webpackBuild'
import {createBanner, createExternals, logGzippedFileSizes} from './webpackUtils'

// These match DEFAULT_TEST_DIRS and DEFAULT_TEST_FILES for co-located tests in
// ./createKarmaConfig.js
const DEFAULT_BABEL_IGNORE_CONFIG = [
  '**/*.spec.js',
  '**/*.test.js',
  '**/__tests__/'
]

/**
 * Run Babel with generated config written to a temporary .babelrc.
 */
function runBabel(name, {copyFiles, outDir, src}, buildBabelConfig, userConfig, cb) {
  let babelConfig = createBabelConfig(buildBabelConfig, userConfig.babel, userConfig.path)
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
    entry: [userConfig.npm.umd.entry || entry],
    output: {
      filename: `${pkg.name}.js`,
      library: userConfig.npm.umd.global,
      libraryExport: 'default',
      libraryTarget: 'umd',
      path: path.resolve('umd'),
    },
    externals: createExternals(userConfig.npm.umd.externals),
    polyfill: false,
    plugins: {
      banner: createBanner(pkg),
      terser: false,
    },
  }

  process.env.NODE_ENV = 'production'
  webpackBuild(null, args, webpackBuildConfig, (err, stats1) => {
    if (err) {
      spinner.fail()
      return cb(err)
    }

    if (userConfig.terser === false) {
      spinner.succeed()
      console.log()
      logGzippedFileSizes(stats1)
      return cb()
    }

    webpackBuildConfig.babel = merge(buildConfig.babel, buildConfig.babelProd || {})
    webpackBuildConfig.devtool = 'source-map'
    webpackBuildConfig.output.filename = `${pkg.name}.min.js`
    webpackBuildConfig.plugins.terser = true
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
      'Unable to build the module as there is a .babelrc in your project\n' +
      'nwb needs to write a temporary .babelrc to configure the build'
    )
  }

  let pluginConfig = getPluginConfig(args)
  let userConfig = getUserConfig(args, {pluginConfig})
  let babelCliOptions = {
    copyFiles: !!args['copy-files'],
    src: path.resolve('src'),
  }

  let tasks = [(cb) => cleanModule(args, cb)]

  // The CommonJS build is enabled by default, and must be explicitly
  // disabled if you don't want it.
  if (userConfig.npm.cjs !== false) {
    tasks.push((cb) => runBabel(
      'ES5',
      {...babelCliOptions, outDir: path.resolve('lib')},
      merge(buildConfig.babel, buildConfig.babelDev || {}, {
        // Don't set the path to nwb's @babel/runtime, as it will need to be a
        // dependency or peerDependency of your module if you enable
        // transform-runtime's 'helpers' option.
        absoluteRuntime: false,
        // Transpile modules to CommonJS
        modules: 'commonjs',
        // Don't force CommonJS users of the CommonJS build to eat a .default
        commonJSInterop: true,
        // Don't enable webpack-specific plugins
        webpack: false,
      }),
      userConfig,
      cb
    ))
  }

  // The ES modules build is enabled by default, and must be explicitly
  // disabled if you don't want it.
  if (userConfig.npm.esModules !== false) {
    tasks.push((cb) => runBabel(
      'ES modules',
      {...babelCliOptions, outDir: path.resolve('es')},
      merge(buildConfig.babel, buildConfig.babelDev || {}, {
        // Don't set the path to nwb's @babel/runtime, as it will need to be a
        // dependency or peerDependency of your module if you enable
        // transform-runtime's 'helpers' option.
        absoluteRuntime: false,
        // Don't enable webpack-specific plugins
        webpack: false,
      }),
      userConfig,
      cb
    ))
  }

  // The UMD build must be explicitly enabled
  if (userConfig.npm.umd) {
    tasks.push((cb) => buildUMD(args, buildConfig, userConfig, cb))
  }

  runSeries(tasks, cb)
}
