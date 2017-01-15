import path from 'path'

import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import NpmInstallPlugin from 'npm-install-webpack-plugin'
import qs from 'qs'
import webpack, {optimize} from 'webpack'
import failPlugin from 'webpack-fail-plugin'
import Md5HashPlugin from 'webpack-md5-hash'
import merge from 'webpack-merge'

import HashedModuleIdsPlugin from '../vendor/HashedModuleIdsPlugin'
import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {deepToString, typeOf} from './utils'
import StatusPlugin from './WebpackStatusPlugin'

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
    if (prefix && prefix.endsWith(name)) {
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

  // Default query options for url-loader
  let urlLoaderOptions = {
    // Don't inline anything by default
    limit: 1,
    // Always use a hash to prevent files with the same name causing issues
    name: '[name].[hash:8].[ext]',
  }

  let loaders = [
    loader('babel', {
      test: /\.js$/,
      loader: require.resolve('babel-loader'),
      exclude: process.env.NWB_TEST ? /(node_modules|nwb[\\/]polyfills\.js$)/ : /node_modules/,
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
      test: /\.(gif|png|webp)(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
    }),
    loader('svg', {
      test: /\.svg(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
    }),
    loader('jpeg', {
      test: /\.jpe?g(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
    }),
    loader('fonts', {
      test: /\.(eot|otf|ttf|woff|woff2)(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
    }),
    loader('video', {
      test: /\.(mp4|ogg|webm)(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
    }),
    loader('audio', {
      test: /\.(wav|mp3|m4a|aac|oga)(\?.*)?$/,
      loader: require.resolve('url-loader'),
      query: {...urlLoaderOptions},
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
 * Plugin for HtmlPlugin which inlines content for an extracted Webpack
 * manifest into the HTML page in a <script> tag before other emitted asssets
 * are injected by HtmlPlugin itself.
 */
function injectManifestPlugin() {
  this.plugin('compilation', (compilation) => {
    compilation.plugin('html-webpack-plugin-before-html-processing', (data, cb) => {
      Object.keys(compilation.assets).forEach(key => {
        if (!key.startsWith('manifest.')) return
        let {children} = compilation.assets[key]
        if (children && children[0]) {
          data.html = data.html.replace(
            /^(\s*)<\/body>/m,
            `$1<script>${children[0]._value}</script>\n$1</body>`
          )
          // Remove the manifest from HtmlPlugin's assets to
          // prevent a <script> tag being created for it.
          var manifestIndex = data.assets.js.indexOf(data.assets.publicPath + key)
          data.assets.js.splice(manifestIndex, 1)
          delete data.assets.chunks.manifest
        }
      })
      cb(null, data)
    })
  })
}

function getCopyPluginArgs(buildConfig, userConfig) {
  let patterns = []
  let options = {}
  if (buildConfig) {
    patterns = patterns.concat(buildConfig)
  }
  if (userConfig) {
    patterns = patterns.concat(userConfig.patterns || [])
    options = userConfig.options || {}
  }
  return [patterns, options]
}

/**
 * Final webpack plugin config consists of:
 * - the default set of plugins created by this function based on whether or not
 *   a server build is being configured, whether or not the build is for an
 *   app (for which HTML will be generated), plus environment variables.
 * - extra plugins managed by this function, whose inclusion is triggered by
 *   build config, which provides default configuration for them which can be
 *   tweaked by user plugin config when appropriate.
 * - any extra plugins defined in build and user config (extra user plugins are
 *   not handled here, but by the final merge of webpack.extra config).
 */
export function createPlugins(server, buildConfig = {}, userConfig = {}) {
  let development = process.env.NODE_ENV === 'development'
  let production = process.env.NODE_ENV === 'production'

  let plugins = [
    // Enforce case-sensitive import paths
    new CaseSensitivePathsPlugin(),
    // Replace specified expressions with values
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...buildConfig.define,
      ...userConfig.define,
    }),
  ]

  // Fail the build if there are compilation errors when running on CI
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
    plugins.push(failPlugin)
  }

  if (server) {
    // HMR is enabled by default but can be explicitly disabled
    if (server.hot !== false) {
      plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
      )
    }
    if (buildConfig.status) {
      plugins.push(new StatusPlugin(buildConfig.status))
    }
    // Use paths as names when serving
    plugins.push(new webpack.NamedModulesPlugin())
  }
  // If we're not serving, we're creating a static build
  else {
    // Extract CSS required as modules out into files
    let cssFilename = production ? `[name].[contenthash:8].css` : '[name].css'
    plugins.push(new ExtractTextPlugin(cssFilename, {
      ...userConfig.extractText,
    }))

    // Move modules imported from node_modules/ into a vendor chunk when enabled
    if (buildConfig.vendor) {
      plugins.push(new optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks(module, count) {
          return (
            module.resource &&
            module.resource.includes('node_modules')
          )
        }
      }))
    }

    // If we're generating an HTML file, we must be building a web app, so
    // configure deterministic hashing for long-term caching.
    if (buildConfig.html) {
      plugins.push(
        // Generate stable module ids instead of having Webpack assign integers.
        // HashedModuleIdsPlugin (vendored from Webpack 2) does this without
        // adding too much to bundle size and NamedModulesPlugin allows for
        // easier debugging of development builds.
        development ? new webpack.NamedModulesPlugin() : new HashedModuleIdsPlugin(),
        // The MD5 Hash plugin seems to make [chunkhash] for .js files behave
        // like [contenthash] does for extracted .css files, which is essential
        // for deterministic hashing.
        new Md5HashPlugin(),
        // The Webpack manifest is normally folded into the last chunk, changing
        // its hash - prevent this by extracting the manifest into its own
        // chunk - also essential for deterministic hashing.
        new optimize.CommonsChunkPlugin({name: 'manifest'}),
        // Inject the Webpack manifest into the generated HTML as a <script>
        injectManifestPlugin,
      )
    }
  }

  if (production) {
    // Temporarily commented out to prevent an error in __webpack_require__
    // See https://github.com/webpack/webpack/issues/959#issuecomment-237438754
    // plugins.push(new optimize.DedupePlugin())
    if (userConfig.uglify !== false) {
      plugins.push(
        new optimize.UglifyJsPlugin(merge({
          compress: {
            warnings: false,
          },
          output: {
            comments: false,
          },
        }, userConfig.uglify))
      )
    }
  }

  // Generate an HTML file for web apps which pulls in generated resources
  if (buildConfig.html) {
    plugins.push(
      new HtmlPlugin({
        chunksSortMode: 'dependency',
        template: path.join(__dirname, '../templates/webpack-template.html'),
        ...buildConfig.html,
        ...userConfig.html,
      }),
    )
  }

  // Copy static resources
  if (buildConfig.copy) {
    plugins.push(
      new CopyPlugin(...getCopyPluginArgs(buildConfig.copy, userConfig.copy))
    )
  }

  // Automatically install missing npm dependencies and add them to package.json
  // Must be enabled with an --install or --auto-install flag
  if (buildConfig.autoInstall) {
    plugins.push(new NpmInstallPlugin({
      quiet: true,
      ...userConfig.install,
    }))
  }

  // Insert a banner comment at the top of generated files - used for UMD builds
  if (buildConfig.banner) {
    plugins.push(new webpack.BannerPlugin(buildConfig.banner))
  }

  // Escape hatch for any extra plugins a particular build ever needs to add
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
export function createPostCSSConfig(userWebpackConfig, cssPreprocessors = {}) {
  // postcss-loader throws an error if a pack name is provided but isn't
  // configured, so we need to set the default PostCSS plugins for every single
  // style pipeline.
  let postcss = {
    defaults: createDefaultPostCSSPlugins(userWebpackConfig),
    vendor: createDefaultPostCSSPlugins(userWebpackConfig),
  }
  Object.keys(cssPreprocessors).forEach(id => {
    postcss[id] = createDefaultPostCSSPlugins(userWebpackConfig)
    postcss[`vendor-${id}`] = createDefaultPostCSSPlugins(userWebpackConfig)
  })
  // Any PostCSS plugins provided by the user will completely overwrite defaults
  return {...postcss, ...userWebpackConfig.postcss}
}

function createDefaultPostCSSPlugins(userWebpackConfig) {
  return [
    autoprefixer({
      browsers: [
        '>1%',
        'last 4 versions',
        'Firefox ESR',
        'not ie < 9',
      ],
      ...userWebpackConfig.autoprefixer
    })
  ]
}

export const COMPAT_CONFIGS = {
  enzyme: {
    externals: {
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': true,
    }
  },
  moment({locales}) {
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
    let compatConfig = COMPAT_CONFIGS[lib]
    if (typeOf(compatConfig) === 'function') {
      compatConfig = compatConfig(userCompatConfig[lib])
      if (!compatConfig) return
    }
    configs.push(compatConfig)
  })
  if (configs.length === 0) return null
  if (configs.length === 1) return {...configs[0]}
  return merge(...configs)
}

/**
 * Add default polyfills to the head of the entry array.
 */
function addPolyfillsToEntry(entry) {
  if (typeOf(entry) === 'array') {
    entry.unshift(require.resolve('../polyfills'))
  }
  else {
    // Assumption: there will only be one entry point, naming the entry chunk
    entry[Object.keys(entry)[0]].unshift(require.resolve('../polyfills'))
  }
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
    entry,
    loaders: buildLoaderConfig = {},
    output: buildOutputConfig,
    polyfill: buildPolyfill,
    plugins: buildPluginConfig = {},
    resolve: buildResolveConfig = {},
    server = false,
    // Any other build config provided is merged directly into the final webpack
    // config to provide the rest of the default config.
    ...otherBuildConfig
  } = buildConfig

  let userWebpackConfig = userConfig.webpack || {}
  let userOutputConfig = {}
  if ('publicPath' in userWebpackConfig) {
    userOutputConfig.publicPath = userWebpackConfig.publicPath
  }
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
    output: {
      ...buildOutputConfig,
      ...userOutputConfig,
    },
    plugins: createPlugins(server, buildPluginConfig, userWebpackConfig),
    resolve: merge({
      extensions: ['', '.js', '.json'],
    }, buildResolveConfig, userResolveConfig),
    // XXX As of v2.25.0, html-webpack-plugin no longer outputs an absolute path
    //     to its loader, so we must fall back to nwb's node_modules/ for global
    //     usage.
    // resolveLoader: {
    //   fallback: path.join(__dirname, '../node_modules'),
    // },
    postcss: createPostCSSConfig(userWebpackConfig, nwbPluginConfig.cssPreprocessors),
    ...otherBuildConfig,
    // Top level loader config can be supplied via user "loaders" config, so we
    // detect, extract and where possible validate it before merging it into the
    // final webpack config object.
    ...getTopLevelLoaderConfig(userWebpackConfig.loaders, nwbPluginConfig.cssPreprocessors),
  }

  if (entry) {
    // Add default polyfills to the entry chunk unless configured not to
    if (buildPolyfill !== false && userConfig.polyfill !== false) {
      addPolyfillsToEntry(entry)
    }
    webpackConfig.entry = entry
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
