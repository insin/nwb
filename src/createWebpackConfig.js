/**
 * Functions for creating a Webpack config with:
 *
 * - a default set of loaders which can be customised for a particular type of
 *   build and further tweaked by the end user.
 * - a default set of plugins which can be customised for a particular type of
 *   build and environment, with only configuration or a flag required to enable
 *   additional pre-selected plugins.
 */
import assert from 'assert'
import path from 'path'

import chalk from 'chalk'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import qs from 'qs'
import webpack, {optimize} from 'webpack'
import merge from 'webpack-merge'

import debug from './debug'
import {endsWith, findNodeModules, typeOf} from './utils'

// Top-level property names reserved for webpack config
// From http://webpack.github.io/docs/configuration.html
const WEBPACK_RESERVED = 'context entry output module resolve resolveLoader externals target bail profile cache watch watchOptions debug devtool devServer node amd loader recordsPath recordsInputPath recordsOutputPath plugins'.split(' ')

export let combineLoaders = loaders =>
  loaders.map(loader => {
    let query = qs.stringify(loader.query, {arrayFormat: 'brackets'})
    return `${loader.loader}${query && `?${query}`}`
  }).join('!')

/**
 * Merge webpack loader config ({test, loader, query, inclue, exclude}) objects.
 */
export function mergeLoaderConfig(defaultConfig = {}, buildConfig = {}, userConfig = {}) {
  // Don't include a 'config' object if the user provided one - this will be
  // configured at the top level instead.
  let {config, ...userLoaderConfig} = userConfig
  let loader = merge(defaultConfig, buildConfig, userLoaderConfig)
  if (loader.query && Object.keys(loader.query).length === 0) {
    delete loader.query
  }
  return loader
}

/**
 * Create a function which configures a loader identified by a unique id, with
 * the option to override defaults with build-specific and user config.
 */
export let loaderConfigFactory = (buildConfig, userConfig) =>
  (id, defaultConfig) => {
    if (id) {
      return {id, ...mergeLoaderConfig(defaultConfig, buildConfig[id], userConfig[id])}
    }
    return defaultConfig
  }

/**
 * Create a function which applies a prefix to a given name when a prefix is
 * given, unless the prefix ends with a name, in which case the prefix itself is
 * returned.
 * The latter rule is to allow loaders created for CSS preprocessor plugins to
 * be given unique ids for user configuration without duplicating the name of
 * the loader.
 * e.g.: styleLoaderName('sass')('css') => 'sass-css'
 *       styleLoaderName('sass')('sass') => 'sass' (as opposed to 'sass-sass')
 */
export let styleLoaderName = (prefix) =>
  (name) => {
    if (prefix && endsWith(prefix, name)) {
      return prefix
    }
    return prefix ? `${prefix}-${name}` : name
  }

/**
 * Create a default style-handling pipeline for either a static build (default)
 * or a server build.
 */
export function createStyleLoader(loader, server, {
  prefix = null,
  extraLoader = null
} = {}) {
  let name = styleLoaderName(prefix)
  let loaders = [
    loader(name('css'), {
      loader: require.resolve('css-loader')
    }),
    loader(name('autoprefixer'), {
      loader: require.resolve('autoprefixer-loader')
    })
  ]

  if (extraLoader) {
    loaders.push(loader(name(extraLoader.id), extraLoader.config))
  }

  if (server) {
    loaders.unshift(loader(name('style'), {
      loader: require.resolve('style-loader')
    }))
    return combineLoaders(loaders)
  }
  else {
    return ExtractTextPlugin.extract(combineLoaders(loaders))
  }
}

export function createLoaders(server, buildConfig = {}, userConfig = {}, pluginConfig = {}) {
  let loader = loaderConfigFactory(buildConfig, userConfig)

  let loaders = [
    loader('babel', {
      test: /\.jsx?$/,
      loader: require.resolve('babel-loader'),
      exclude: /node_modules/
    }),
    loader('css-pipeline', {
      test: /\.css$/,
      loader: createStyleLoader(loader, server),
      exclude: /node_modules/
    }),
    loader('vendor-css-pipeline', {
      test: /\.css$/,
      loader: createStyleLoader(loader, server, {
        prefix: 'vendor'
      }),
      include: /node_modules/
    }),
    loader('graphics', {
      test: /\.(gif|png)$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240
      }
    }),
    loader('jpeg', {
      test: /\.jpe?g$/,
      loader: require.resolve('file-loader')
    }),
    loader('fonts', {
      test: /\.(otf|svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240
      }
    }),
    loader('eot', {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('file-loader')
    }),
    loader('json', {
      test: /\.json$/,
      loader: require.resolve('json-loader')
    }),
    // Extra loaders from build config, still configurable via user config when
    // the loaders specify an id.
    ...createExtraLoaders(buildConfig.extra, userConfig),
    // Extra loaders from user config
    ...userConfig.extra || []
  ]

  if (pluginConfig.cssPreprocessors) {
    Object.keys(pluginConfig.cssPreprocessors).forEach(id => {
      let {test, ...config} = pluginConfig.cssPreprocessors[id]
      loaders.push(
        loader(`${id}-pipeline`, {
          test,
          loader: createStyleLoader(loader, server, {
            extraLoader: {id, config},
            prefix: id
          }),
          exclude: /node_modules/
        })
      )
      loaders.push(
        loader(`vendor-${id}-pipeline`, {
          test,
          loader: createStyleLoader(loader, server, {
            extraLoader: {id, config},
            prefix: `vendor-${id}`
          }),
          include: /node_modules/
        })
      )
    })
  }

  return loaders
}

/**
 * Create loaders from loader definitions which may include an id attribute for
 * user customisation. It's assumed these are being created from build config.
 */
export function createExtraLoaders(extraLoaders = [], userConfig = {}) {
  let loader = loaderConfigFactory({}, userConfig)
  return extraLoaders.map(extraLoader => {
    let {id, ...loaderConfig} = extraLoader
    return loader(id, loaderConfig)
  })
}

/**
 * A webpack plugin which forces the build to fail by exiting with a non-zero
 * code when there are compilation errors. This is intended for use on a CI
 * server which is running webpack builds.
 */
export function failBuildOnCompilationError() {
  this.plugin('done', ({compilation}) => {
    if (compilation.errors && compilation.errors.length > 0) {
      console.error(chalk.red('nwb: webpack build failed:'))
      compilation.errors.forEach(error => console.error(chalk.red(error.message)))
      process.exit(1)
    }
  })
}

export function createPlugins(server, cwd, {
  // Banner comment to be added to each generated file in a UMD build
  banner,
  // Extra constant replacements for DefinePlugin. Since plugins aren't
  // currently exposed for user config, it's assumed any user-provided defines
  // have already been merged into this.
  define,
  // Escape hatch for adding new build-specific plugins
  extra,
  // Options for HtmlWebpackPlugin
  html,
  // Name to use for a vendor chunk - providing a name causes it to be created.
  vendorChunkName
} = {}) {
  let plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...define
    }),
    new optimize.DedupePlugin(),
    new optimize.OccurenceOrderPlugin()
  ]

  // Assumption: we're always hot reloading if we're bundling on the server
  if (server) {
    plugins.unshift(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    )
  }

  if (process.env.CONTINUOUS_INTEGRATION === 'true') {
    plugins.unshift(failBuildOnCompilationError)
  }

  if (!server) {
    plugins.push(new ExtractTextPlugin(`[name].css`))
  }

  // Move modules imported from node_modules into a vendor chunk
  if (vendorChunkName) {
    plugins.push(new optimize.CommonsChunkPlugin({
      name: vendorChunkName,
      minChunks(module, count) {
        return (
          module.resource &&
          module.resource.indexOf(path.resolve(cwd, 'node_modules')) === 0
        )
      }
    }))
  }

  if (process.env.NODE_ENV === 'production') {
    plugins.push(new optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }))
  }

  if (html) {
    plugins.push(new HtmlWebpackPlugin({
      template: path.join(__dirname, '../templates/webpack-template.html'),
      ...html
    }))
  }

  if (banner) {
    plugins.push(new webpack.BannerPlugin(banner))
  }

  if (extra) {
    plugins = plugins.concat(extra)
  }

  return plugins
}

/**
 * Extract top-level loader configuration provided by the user.
 */
export function getTopLevelLoaderConfig(userLoaderConfig, cssPreprocessors = {}) {
  if (!userLoaderConfig || Object.keys(userLoaderConfig).length === 0) {
    return {}
  }

  let topLevelLoaderConfig = {}
  Object.keys(userLoaderConfig).forEach(loaderId => {
    let loaderConfig = userLoaderConfig[loaderId]
    if (!('config' in loaderConfig)) return

    // Determine the proeprty to set top level loader config under
    let configPropertyName

    // Trust the user to specify their own config key for loaders with support
    if (loaderConfig.query && 'config' in loaderConfig.query) {
      configPropertyName = loaderConfig.query.config
    }
    else {
      // Otherwise, determine the correct config key
      let id = loaderId.replace(/^vendor-/, '')
      if (id in cssPreprocessors) {
        if (!cssPreprocessors[id].defaultConfig) {
          throw new Error(`The ${id} CSS preprocessor loader doesn't support a default top-level config object.`)
        }
        configPropertyName = cssPreprocessors[id].defaultConfig
      }
      else if (id === 'babel') {
        configPropertyName = 'babel'
      }
      else {
        throw new Error(`The ${id} loader doesn't appear to support a default top-level config object.`)
      }
    }

    if (WEBPACK_RESERVED.indexOf(configPropertyName) !== -1) {
      throw new Error(
        `User config for the ${loaderId} loader cannot be set in ${configPropertyName} - this is reserved for use by Webpack.`
      )
    }
    else if (configPropertyName in topLevelLoaderConfig) {
      throw new Error(
        `User config for the ${loaderId} loader cannot be set in ${configPropertyName} - this has alraedy been used.`
      )
    }

    topLevelLoaderConfig[configPropertyName] = loaderConfig.config
  })

  return topLevelLoaderConfig
}

/**
 * Create a webpack config with a curated set of default loaders suitable for
 * creating a static build (default) or serving an app with hot reloading.
 */
export default function createWebpackConfig(cwd, buildConfig, pluginConfig = {}, userConfig = {}) {
  assert.equal(typeOf(cwd), 'string', 'cwd is required')
  assert.equal(typeOf(buildConfig), 'object', 'buildConfig is required')
  debug('createWebpackConfig cwd = %s', cwd)
  debug('createWebpackConfig buildConfig = %j', buildConfig)

  let {
    loaders = {}, postLoaders = [], plugins = {}, resolve = {}, server = false, ...otherBuildConfig
  } = buildConfig

  let topLevelLoaderConfig = getTopLevelLoaderConfig(userConfig.loaders,
                                                     pluginConfig.cssPreprocessors)

  return {
    module: {
      loaders: createLoaders(server, loaders, userConfig.loaders, pluginConfig),
      postLoaders: createExtraLoaders(postLoaders, userConfig.loaders)
    },
    plugins: createPlugins(server, cwd, plugins),
    resolve: merge({
      alias: {
        // Alias babel-runtime so it can be found from nwb's dependencies when
        // using Babel stage: 0 and optional: ['runtime'] for async/await.
        'babel-runtime': path.join(findNodeModules(), 'babel-runtime')
      },
      extensions: ['', '.web.js', '.js', '.jsx', '.json']
    }, resolve),
    ...otherBuildConfig,
    ...topLevelLoaderConfig
  }
}
