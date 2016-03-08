import path from 'path'

import autoprefixer from 'autoprefixer'
import {red} from 'chalk'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import NpmInstallPlugin from 'npm-install-webpack-plugin'
import qs from 'qs'
import webpack, {optimize} from 'webpack'
import failPlugin from 'webpack-fail-plugin'
import merge from 'webpack-merge'

import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {deepToString, endsWith} from './utils'

// Default query configuration for file-loader and url-loader
const FILE_LOADER_DEFAULTS = {
  name: '[name].[hash:8].[ext]'
}

// Top-level property names reserved for webpack config
// From http://webpack.github.io/docs/configuration.html
const WEBPACK_RESERVED = 'context entry output module resolve resolveLoader externals target bail profile cache watch watchOptions debug devtool devServer node amd loader recordsPath recordsInputPath recordsOutputPath plugins'.split(' ')

/**
 * Create a loader string from a list of {loader, query} objects.
 */
export let combineLoaders = loaders =>
  loaders.map(loader => {
    let query = qs.stringify(loader.query, {arrayFormat: 'brackets'})
    return `${loader.loader}${query && `?${query}`}`
  }).join('!')

/**
 * Merge webpack loader config ({test, loader, query, include, exclude}) objects.
 */
export function mergeLoaderConfig(defaultConfig = {}, buildConfig = {}, userConfig = {}) {
  // Don't include a 'config' object if the user provided one - this will be
  // configured at the top level instead.
  let {config, ...userLoaderConfig} = userConfig // eslint-disable-line no-unused-vars
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
  preprocessor = null,
  prefix = null,
} = {}) {
  let name = styleLoaderName(prefix)
  let loaders = [
    loader(name('css'), {
      loader: require.resolve('css-loader'),
      query: {
        // Apply postcss-loader to @imports
        importLoaders: 1,
      },
    }),
    loader(name('postcss'), {
      loader: require.resolve('postcss-loader'),
      query: {
        pack: prefix,
      },
    })
  ]

  if (preprocessor) {
    loaders.push(loader(name(preprocessor.id), preprocessor.config))
  }

  if (server) {
    loaders.unshift(
      loader(name('style'), {
        loader: require.resolve('style-loader'),
      })
    )
    return combineLoaders(loaders)
  }
  else {
    return ExtractTextPlugin.extract(
      require.resolve('style-loader'),
      combineLoaders(loaders)
    )
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
      exclude: /node_modules/,
      query: {
        // Don't look for .babelrc files
        babelrc: false,
        // Cache transformations to the filesystem (in default OS temp dir)
        cacheDirectory: true,
      }
    }),
    loader('css-pipeline', {
      test: /\.css$/,
      loader: createStyleLoader(loader, server),
      exclude: /node_modules/,
    }),
    loader('vendor-css-pipeline', {
      test: /\.css$/,
      loader: createStyleLoader(loader, server, {
        prefix: 'vendor',
      }),
      include: /node_modules/,
    }),
    loader('graphics', {
      test: /\.(gif|png)$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240,
        ...FILE_LOADER_DEFAULTS,
      },
    }),
    loader('jpeg', {
      test: /\.jpe?g$/,
      loader: require.resolve('file-loader'),
      query: {
        ...FILE_LOADER_DEFAULTS,
      },
    }),
    loader('fonts', {
      test: /\.(otf|svg|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240,
        ...FILE_LOADER_DEFAULTS,
      },
    }),
    loader('eot', {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('file-loader'),
      query: {
        ...FILE_LOADER_DEFAULTS,
      },
    }),
    loader('json', {
      test: /\.json$/,
      loader: require.resolve('json-loader'),
    }),
    // Extra loaders from build config, still configurable via user config when
    // the loaders specify an id.
    ...createExtraLoaders(buildConfig.extra, userConfig),
  ]

  if (pluginConfig.cssPreprocessors) {
    Object.keys(pluginConfig.cssPreprocessors).forEach(id => {
      let {test, ...config} = pluginConfig.cssPreprocessors[id]
      loaders.push(
        loader(`${id}-pipeline`, {
          test,
          loader: createStyleLoader(loader, server, {
            prefix: id,
            preprocessor: {id, config},
          }),
          exclude: /node_modules/
        })
      )
      loaders.push(
        loader(`vendor-${id}-pipeline`, {
          test,
          loader: createStyleLoader(loader, server, {
            prefix: `vendor-${id}`,
            preprocessor: {id, config},
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
 * Final webpack plugin config consists of:
 * - the default set of plugins created by this function based on whether or not
 *   a server build is being configured, plus environment variables.
 * - extra plugins managed by this function, whose inclusion is triggered by
 *   build config, which provides default configuration for them which can be
 *   tweaked by user plugin config when appropriate.
 * - any extra plugins defined in build and user config.
 */
export function createPlugins(server, buildConfig = {}, userConfig = {}) {
  let plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...buildConfig.define,
      ...userConfig.define,
    }),
    new optimize.OccurenceOrderPlugin()
  ]

  // Assumption: we're always hot reloading if we're bundling on the server
  if (server) {
    plugins.unshift(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    )
  }

  // Fail the build if there are compilation errors when running on CI
  if (process.env.CONTINUOUS_INTEGRATION === 'true') {
    plugins.push(failPlugin)
  }

  if (!server) {
    plugins.push(new ExtractTextPlugin('[name].css', {
      ...userConfig.extractText,
    }))

    // Move modules imported from node_modules into a vendor chunk
    if (userConfig.vendorBundle !== false && buildConfig.vendorChunkName) {
      plugins.push(new optimize.CommonsChunkPlugin({
        name: buildConfig.vendorChunkName,
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
    plugins.push(new optimize.DedupePlugin())
    plugins.push(new optimize.UglifyJsPlugin(merge({
      compress: {
        screw_ie8: true,
        warnings: false,
      },
      mangle: {
        screw_ie8: true,
      },
      output: {
        comments: false,
        screw_ie8: true,
      },
    }, userConfig.uglify)))
  }

  if (buildConfig.html) {
    plugins.push(new HtmlWebpackPlugin({
      template: path.join(__dirname, '../templates/webpack-template.html'),
      ...buildConfig.html,
      ...userConfig.html,
    }))
  }

  if (buildConfig.install) {
    plugins.push(new NpmInstallPlugin({
      ...buildConfig.install,
      ...userConfig.install,
    }))
  }

  if (buildConfig.banner) {
    plugins.push(new webpack.BannerPlugin(buildConfig.banner))
  }

  if (buildConfig.extra) {
    plugins = plugins.concat(buildConfig.extra)
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
 * Create top-level PostCSS plugin config for each style pipeline.
 */
export function createPostCSSConfig(userPostCSSConfig, cssPreprocessors = {}) {
  // postcss-loader throws an error if a pack name is provided but isn't
  // configured, so we need to set the default PostCSS plugins for every single
  // style pipeline.
  let postcss = {
    defaults: createDefaultPostCSSPlugins(),
    vendor: createDefaultPostCSSPlugins(),
  }
  Object.keys(cssPreprocessors).forEach(id => {
    postcss[id] = createDefaultPostCSSPlugins()
    postcss[`vendor-${id}`] = createDefaultPostCSSPlugins()
  })
  // Any PostCSS plugins provided by the user will completely overwrite defaults
  return {...postcss, ...userPostCSSConfig}
}

function createDefaultPostCSSPlugins() {
  return [autoprefixer()]
}

export const COMPAT_CONFIGS = {
  enzyme: {
    externals: {
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': true,
    }
  },
  'json-schema': {
    module: {
      noParse: [/node_modules[/\\]json-schema[/\\]lib[/\\]validate\.js/],
    },
  },
  moment({locales}) {
    if (!Array.isArray(locales)) {
      console.error(red("nwb: webpack.compat.moment config must provide a 'locales' Array"))
      return
    }
    return {
      plugins: [
        new webpack.ContextReplacementPlugin(
          /moment[/\\]locale$/,
          new RegExp(`^\\.\\/(${locales.join('|')})$`)
        )
      ]
    }
  },
  sinon: {
    module: {
      noParse: [/[/\\]sinon\.js/],
    },
    resolve: {
      alias: {
        sinon: 'sinon/pkg/sinon',
      },
    },
  },
}

/**
 * Create a chunk of webpack config containing compatibility tweaks for
 * libraries which are known to cause issues, to be merged into the generated
 * config.
 * Returns null if there's nothing to merge based on user config.
 */
export function getCompatConfig(userCompatConfig = {}) {
  let configs = []
  Object.keys(userCompatConfig).map(lib => {
    if (!userCompatConfig[lib]) return
    if (!COMPAT_CONFIGS.hasOwnProperty(lib)) {
      console.error(red(`nwb: unknown property in webpack.compat config: ${lib}`))
      return
    }
    let compatConfig = COMPAT_CONFIGS[lib]
    if (typeof compatConfig == 'function') {
      compatConfig = compatConfig(userCompatConfig[lib])
      if (!compatConfig) return
    }
    configs.push(compatConfig)
  })
  return configs.length > 0 ? merge(...configs) : null
}

/**
 * Create a webpack config with a curated set of default loaders suitable for
 * creating a static build (default) or serving an app with hot reloading.
 */
export default function createWebpackConfig(buildConfig, nwbPluginConfig = {}, userConfig = {}) {
  debug('createWebpackConfig buildConfig: %s', deepToString(buildConfig))

  // Final webpack config is primarily driven by build configuration for the nwb
  // command being run. Each command configures a default, working webpack
  // configuration for the task it needs to perform.
  let {
    // These build config items are used to create chunks of webpack config,
    // rather than being included as-is.
    babel: buildBabelConfig = {},
    loaders: buildLoaderConfig = {},
    plugins: buildPluginConfig = {},
    resolve: buildResolveConfig = {},
    server = false,
    // Any other build config provided is merged directly into the final webpack
    // config to provide the rest of the default config.
    ...otherBuildConfig
  } = buildConfig

  let userWebpackConfig = userConfig.webpack || {}
  let userResolveConfig = {}
  if (userWebpackConfig.aliases) {
    userResolveConfig.alias = userWebpackConfig.aliases
  }

  // Generate config for babel-loader and set it as loader config for the build
  buildLoaderConfig.babel = {query: createBabelConfig(buildBabelConfig, userConfig.babel)}

  let webpackConfig = {
    module: {
      loaders: createLoaders(server, buildLoaderConfig, userWebpackConfig.loaders, nwbPluginConfig)
    },
    plugins: createPlugins(server, buildPluginConfig, userWebpackConfig),
    resolve: merge({
      extensions: ['', '.web.js', '.js', '.jsx', '.json'],
      // Fall back to resolving runtime dependencies from nwb's dependencies,
      // e.g. for babel-runtime when using the transform-runtime plugin.
      fallback: path.join(__dirname, '../node_modules'),
    }, buildResolveConfig, userResolveConfig),
    postcss: createPostCSSConfig(userWebpackConfig.postcss, nwbPluginConfig.cssPreprocessors),
    ...otherBuildConfig,
    // Top level loader config can be supplied via user "loaders" config, so we
    // detect, extract and where possible validate it before merging it into the
    // final webpack config object.
    ...getTopLevelLoaderConfig(userWebpackConfig.loaders, nwbPluginConfig.cssPreprocessors),
  }

  // Create and merge compatibility configuration into the generated config if
  // specified.
  if (userWebpackConfig.compat) {
    let compatConfig = getCompatConfig(userWebpackConfig.compat)
    if (compatConfig) {
      webpackConfig = merge(webpackConfig, compatConfig)
    }
  }

  // Any extra user webpack config is merged into the generated config to give
  // them even more control.
  if (userWebpackConfig.extra) {
    webpackConfig = merge(webpackConfig, userWebpackConfig.extra)
  }

  return webpackConfig
}
