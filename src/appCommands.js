// @flow
import fs from 'fs'
import path from 'path'

import runSeries from 'run-series'
import merge from 'webpack-merge'

import cleanApp from './commands/clean-app'
import {DEFAULT_BROWSERS_DEV, DEFAULT_BROWSERS_PROD} from './constants'
import {directoryExists, install} from './utils'
import webpackBuild from './webpackBuild'
import webpackServer from './webpackServer'

import type {ErrBack} from './types'

type AppConfig = {
  getName: () => string,
  getBuildDependencies: () => string[],
  getBuildConfig: () => Object,
  getServeConfig: () => Object,
};

const DEFAULT_HTML_PATH = 'src/index.html'

/**
 * Create a build, installing any required dependencies first if they're not
 * resolvable.
 */
export function build(args: Object, appConfig: AppConfig, cb: ErrBack) {
  let dist = args._[2] || 'dist'

  let tasks = [
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(
      `${appConfig.getName()} app`,
      args,
      () => createBuildConfig(args, appConfig.getBuildConfig()),
      cb
    ),
  ]

  let buildDependencies = appConfig.getBuildDependencies()
  if (buildDependencies.length > 0) {
    tasks.unshift((cb) => install(buildDependencies, {check: true}, cb))
  }

  runSeries(tasks, cb)
}

/**
 * Create default command config for building an app and merge any extra config
 * provided into it.
 */
export function createBuildConfig(args: Object, extra: Object = {}) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config: Object = {
    babel: {
      env: {
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
      targets: DEFAULT_BROWSERS_PROD,
    },
    devtool: 'source-map',
    entry: {
      app: [entry],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: args.html !== false && getDefaultHTMLConfig(),
      vendor: args.vendor !== false,
    },
  }

  if (directoryExists('public')) {
    config.plugins.copy = [{
      from: path.resolve('public'),
      to: dist,
      globOptions: {ignore: ['.gitkeep']}
    }]
  }

  return merge(config, extra)
}

/**
 * Create default command config for serving an app and merge any extra config
 * objects provided into it.
 */
export function createServeConfig(args: Object, ...extra: Object[]) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config: Object = {
    babel: {
      env: {
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
      targets: DEFAULT_BROWSERS_DEV,
    },
    entry: [entry],
    output: {
      path: dist,
      filename: '[name].js',
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
    },
  }

  if (directoryExists('public')) {
    config.plugins.copy = [{
      from: path.resolve('public'),
      to: dist,
      globOptions: {ignore: ['.gitkeep']}
    }]
  }

  return merge(config, ...extra)
}

/**
 * Create default config for html-webpack-plugin.
 */
export function getDefaultHTMLConfig(cwd: string = process.cwd()) {
  // Use the default HTML template path if it exists
  if (fs.existsSync(path.join(cwd, DEFAULT_HTML_PATH))) {
    return {
      template: DEFAULT_HTML_PATH,
    }
  }
  // Otherwise provide default variables for the internal template, in case we
  // fall back to it.
  return {
    lang: 'en',
    mountId: 'app',
    title: require(path.join(cwd, 'package.json')).name,
  }
}

/**
 * Run a development server.
 */
export function serve(args: Object, appConfig: AppConfig, cb: ErrBack) {
  webpackServer(
    args,
    () => createServeConfig(args, appConfig.getServeConfig()),
    cb
  )
}
