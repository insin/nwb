import assert from 'assert'
import path from 'path'

import chalk from 'chalk'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import NpmInstallPlugin from 'npm-install-webpack-plugin'
import qs from 'qs'
import webpack, {optimize} from 'webpack'
import merge from 'webpack-merge'

import debug from './debug'
import {endsWith, typeOf} from './utils'

// Default query configuration for file-loader and url-loader
const FILE_LOADER_DEFAULTS = {
  name: '[name].[ext]?[hash]'
}

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

/**
 * Final webpack loader config consists of:
 * - the default set of loaders created in this function, with build and user
 *   config tweaks based on loader id.
 * - extra loaders defined in build config, with user config tweaks based
 *   on loader id.
 * - extra loaders created for CSS preprocessor plugins, with user config
 *   tweaks based on loader id.
 * - extra loaders defined in user config.
 */
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
        limit: 10240,
        ...FILE_LOADER_DEFAULTS
      }
    }),
    loader('jpeg', {
      test: /\.jpe?g$/,
      loader: require.resolve('file-loader'),
      query: {
        ...FILE_LOADER_DEFAULTS
      }
    }),
    loader('fonts', {
      test: /\.(otf|svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240,
        ...FILE_LOADER_DEFAULTS
      }
    }),
    loader('eot', {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('file-loader'),
      query: {
        ...FILE_LOADER_DEFAULTS
      }
    }),
    loader('json', {
      test: /\.json$/,
      loader: require.resolve('json-loader')
    }),
    // Extra loaders from build config, still configurable via user config when
    // the loaders specify an id.
    ...createExtraLoaders(buildConfig.extra, userConfig)
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

/**
 * Final webpack plugin config consists of:
 * - the default set of plugins created by this function based on whether or not
 *   a server build is being configured, plus environment variables.
 * - extra plugins managed by this function, whose inclusion is triggered by
 *   build config, which provides default configuration for them which can be
 *   tweaked by user plugin config when appropriate.
 * - any extra plugins defined in build and user config.
 */
export function createPlugins(server, buildConfig = {}, userConfig = {}) {
  let {
    // Banner comment to be added to each generated file in a UMD build
    banner,
    // Extra constant replacements for DefinePlugin
    define,
    // Escape hatch for adding new build-specific plugins
    extra,
    // Options for HtmlWebpackPlugin
    html,
    // Options for NpmInstallPlugin
    install,
    // Name to use for a vendor chunk - providing a name causes it to be created.
    vendorChunkName
  } = buildConfig

  let plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...define,
      ...userConfig.define
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
    plugins.push(new ExtractTextPlugin(`[name].css`, {
      ...userConfig.extractText
    }))

    // Move modules imported from node_modules into a vendor chunk
    if (vendorChunkName) {
      plugins.push(new optimize.CommonsChunkPlugin({
        name: vendorChunkName,
        minChunks(module, count) {
          return (
            module.resource &&
            module.resource.indexOf(path.resolve('node_modules')) === 0
          )
        }
      }))
    }
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
      ...html,
      ...userConfig.html
    }))
  }

  if (install) {
    plugins.push(new NpmInstallPlugin({
      ...install,
      ...userConfig.install
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
        `User config for the ${loaderId} loader cannot be set in ${configPropertyName} - this has already been used.`
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
export default function createWebpackConfig(buildConfig, nwbPluginConfig = {}, userConfig = {}) {
  assert.equal(typeOf(buildConfig), 'object', 'buildConfig is required')
  debug('createWebpackConfig buildConfig = %j', buildConfig)

  // Final webpack config is primarily driven by build configuration for the nwb
  // command being run. Each command configures a default, working webpack
  // configuration for the task it needs to perform.
  let {
    // These build config items are used to creating chunks of webpack config,
    // rather than being included as-is.
    loaders = {},
    plugins = {},
    resolve = {},
    server = false,
    // Any other build config provided is merged directly into the final webpack
    // config to provide the rest of the default config.
    ...otherBuildConfig
  } = buildConfig

  let {
    // Loader and plugin config is managed by nwb, with the ability to use
    // "extra" config to define arbitrary additional loaders and plugins.
    loaders: userLoaderConfig = {},
    plugins: userPluginConfig = {},
    // Any extra user webpack config is deep-merged into the generated config
    // object to give the user even more control. This needs to be used very
    // carefully as different nwb commands have different webpack config needs.
    extra: userExtraWebpackConfig = {}
  } = userConfig

  return merge({
    module: {
      loaders: createLoaders(server, loaders, userLoaderConfig, nwbPluginConfig)
    },
    plugins: createPlugins(server, plugins, userPluginConfig),
    resolve: merge({
      extensions: ['', '.web.js', '.js', '.jsx', '.json'],
      // Fall back to resolving runtime dependencies from nwb's dependencies,
      // e.g. for babel-runtime when using Babel stage: 0 and optional:
      // ['runtime'] for async/await.
      fallback: path.join(__dirname, '../node_modules')
    }, resolve),
    ...otherBuildConfig,
    // Top level loader config can be supplied via user "loaders" config, so we
    // detect, extract and where possible validate it before merging it into the
    // final webpack config object.
    ...getTopLevelLoaderConfig(userLoaderConfig, nwbPluginConfig.cssPreprocessors)
  }, userExtraWebpackConfig)
}
