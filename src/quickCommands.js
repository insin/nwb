// @flow
import path from 'path'

import runSeries from 'run-series'
import merge from 'webpack-merge'

import cleanApp from './commands/clean-app'
import {UserError} from './errors'
import {install} from './utils'
import webpackBuild from './webpackBuild'
import webpackServer from './webpackServer'

import type {ErrBack} from './types'

type QuickConfigOptions = {
  // Extra command config to be merged in
  commandConfig?: Object,
  // Default <title>
  defaultTitle: string,
  // Path to a module which handles rendering if something suitable was
  // exported from the entry module the user provided.
  renderShim: ?string,
  // Aliases which allow the render shim module to resolve modules it needs to
  // import from the working directory.
  renderShimAliases: ?Object,
};

type QuickAppConfig = {
  getName: () => string,
  getQuickDependencies: () => string[],
  getQuickBuildConfig: () => Object,
  getQuickServeConfig: () => Object,
};

/**
 * Create a quick build, installing any required dependencies first if
 * they're not resolvable.
 */
export function build(args: Object, appConfig: QuickAppConfig, cb: ErrBack) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => install(appConfig.getQuickDependencies(), {args, check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(
      `${appConfig.getName()} app`,
      args,
      () => createBuildConfig(args, appConfig.getQuickBuildConfig()),
      cb
    ),
  ], cb)
}

/**
 * Create default command config for a quick app build and merge any extra
 * config provided into it.
 */
export function createBuildConfig(args: Object, options: QuickConfigOptions) {
  let {
    commandConfig: extraConfig = {},
    defaultTitle,
    renderShim,
    renderShimAliases,
  } = options

  let entry = path.resolve(args._[1])
  let dist = path.resolve(args._[2] || 'dist')
  let mountId = args['mount-id'] || 'app'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config: Object = {
    babel: {
      proposals: {
        all: true
      }
    },
    devtool: 'source-map',
    output: {
      chunkFilename: filenamePattern,
      filename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || defaultTitle,
      },
      // A vendor bundle can be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
  }

  if (renderShim == null || args.force === true) {
    config.entry = {app: [entry]}
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = {app: [renderShim]}
    config.plugins.define = {NWB_QUICK_MOUNT_ID: JSON.stringify(mountId)}
    config.resolve = {
      alias: {
        // Allow the render shim module to import the provided entry module
        'nwb-quick-entry': entry,
        // Allow the render shim module to import modules from the cwd
        ...renderShimAliases,
      }
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return merge(config, extraConfig)
}

/**
 * Create default command config for quick serving and merge any extra config
 * provided into it.
 */
export function createServeConfig(args: Object, options: QuickConfigOptions) {
  let {
    commandConfig: extraConfig = {},
    defaultTitle,
    renderShim,
    renderShimAliases,
  } = options

  let entry = path.resolve(args._[1])
  let dist = path.resolve(args._[2] || 'dist')
  let mountId = args['mount-id'] || 'app'

  let config: Object = {
    babel: {
      proposals: {
        all: true
      }
    },
    output: {
      filename: 'app.js',
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || defaultTitle,
      },
    },
  }

  if (args.force === true || renderShim == null) {
    config.entry = [entry]
  }
  else {
    config.entry = [renderShim]
    config.plugins.define = {NWB_QUICK_MOUNT_ID: JSON.stringify(mountId)}
    config.resolve = {
      alias: {
        // Allow the render shim module to import the provided entry module
        'nwb-quick-entry': entry,
        // Allow the render shim module to import modules from the cwd
        ...renderShimAliases,
      }
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return merge(config, extraConfig)
}

/**
 * Run a quick development server, installing any required dependencies first if
 * they're not resolvable.
 */
export function serve(args: Object, appConfig: QuickAppConfig, cb: ErrBack) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  runSeries([
    (cb) => install(appConfig.getQuickDependencies(), {args, check: true}, cb),
    (cb) => webpackServer(args, createServeConfig(args, appConfig.getQuickServeConfig()), cb),
  ], cb)
}
