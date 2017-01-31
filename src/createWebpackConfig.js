import path from 'path'

import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import NpmInstallPlugin from '@insin/npm-install-webpack-plugin' // XXX Temporary
import webpack, {optimize} from 'webpack'
import Md5HashPlugin from 'webpack-md5-hash'
import merge from 'webpack-merge'

import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {deepToString, typeOf} from './utils'
import StatusPlugin from './WebpackStatusPlugin'

// Custom merge which replaces arrays instead of merging them. The only arrays
// used in default options are for PostCSS plugins, which we want the user to be
// able to completely override.
let replaceArrayMerge = merge({customizeArray(a, b, key) { return b }})

/**
 * Merge webpack rule config ({test, loader|use, options, include, exclude}) objects.
 */
export function mergeRuleConfig(defaultConfig = {}, buildConfig = {}, userConfig = {}) {
  let rule = replaceArrayMerge(defaultConfig, buildConfig, userConfig)
  if (rule.options && Object.keys(rule.options).length === 0) {
    delete rule.options
  }
  return rule
}

/**
 * Create a function which configures a rule identified by a unique id, with
 * the option to override defaults with build-specific and user config.
 */
export let ruleConfigFactory = (buildConfig, userConfig = {}) =>
  (id, defaultConfig) => {
    if (id) {
      let rule = mergeRuleConfig(defaultConfig, buildConfig[id], userConfig[id])
      return rule
    }
    return defaultConfig
  }

/**
 * Create a function which applies a prefix to a given name when a prefix is
 * given, unless the prefix ends with a name, in which case the prefix itself is
 * returned.
 * The latter rule is to allow rules created for CSS preprocessor plugins to
 * be given unique ids for user configuration without duplicating the name of
 * the rule.
 * e.g.: styleRuleName('sass')('css') => 'sass-css'
 *       styleRuleName('sass')('sass') => 'sass' (as opposed to 'sass-sass')
 */
export let styleRuleName = (prefix) =>
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
export function createStyleLoaders(loader, server, userWebpackConfig, {
  preprocessor = null,
  prefix = null,
} = {}) {
  let name = styleRuleName(prefix)
  let styleLoader = loader(name('style'), {
    loader: require.resolve('style-loader'),
  })
  let loaders = [
    loader(name('css'), {
      loader: require.resolve('css-loader'),
      options: {
        // Apply postcss-loader to @imports
        importLoaders: 1,
      },
    }),
    loader(name('postcss'), {
      loader: require.resolve('postcss-loader'),
      options: {
        plugins: createDefaultPostCSSPlugins(userWebpackConfig),
      }
    })
  ]

  if (preprocessor) {
    loaders.push(loader(name(preprocessor.id), preprocessor.config))
  }

  if (server) {
    loaders.unshift(styleLoader)
    return loaders
  }
  else {
    return ExtractTextPlugin.extract({
      fallbackLoader: styleLoader,
      loader: loaders,
    })
  }
}

/**
 * Final webpack rules config consists of:
 * - the default set of rules created in this function, with build and user
 *   config tweaks based on rule id.
 * - extra rules defined in build config, with user config tweaks based
 *   on rule id.
 * - extra rules created for CSS preprocessor plugins, with user config
 *   tweaks based on loader id.
 * - extra rules defined in user config.
 */
export function createRules(server, buildConfig = {}, userWebpackConfig = {}, pluginConfig = {}) {
  let rule = ruleConfigFactory(buildConfig, userWebpackConfig.rules)

  // Default options for url-loader
  let urlLoaderOptions = {
    // Don't inline anything by default
    limit: 1,
    // Always use a hash to prevent files with the same name causing issues
    name: '[name].[hash:8].[ext]',
  }

  let rules = [
    rule('babel', {
      test: /\.js$/,
      loader: require.resolve('babel-loader'),
      exclude: process.env.NWB_TEST ? /(node_modules|nwb[\\/]polyfills\.js$)/ : /node_modules/,
      options: {
        // Don't look for .babelrc files
        babelrc: false,
        // Cache transformations to the filesystem (in default temp dir)
        cacheDirectory: true,
      }
    }),
    rule('css-pipeline', {
      test: /\.css$/,
      use: createStyleLoaders(rule, server, userWebpackConfig),
      exclude: /node_modules/,
    }),
    rule('vendor-css-pipeline', {
      test: /\.css$/,
      use: createStyleLoaders(rule, server, userWebpackConfig, {
        prefix: 'vendor',
      }),
      include: /node_modules/,
    }),
    rule('graphics', {
      test: /\.(gif|png|webp)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    rule('svg', {
      test: /\.svg$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    rule('jpeg', {
      test: /\.jpe?g$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    rule('fonts', {
      test: /\.(eot|otf|ttf|woff|woff2)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    rule('video', {
      test: /\.(mp4|ogg|webm)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    rule('audio', {
      test: /\.(wav|mp3|m4a|aac|oga)(\?.*)?$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    // Extra rules from build config, still configurable via user config when
    // the rules specify an id.
    ...createExtraRules(buildConfig.extra, userWebpackConfig.rules),
  ]

  if (pluginConfig.cssPreprocessors) {
    Object.keys(pluginConfig.cssPreprocessors).forEach(id => {
      let {test, loader: preprocessorLoader} = pluginConfig.cssPreprocessors[id]
      rules.push(
        rule(`${id}-pipeline`, {
          test,
          use: createStyleLoaders(rule, server, userWebpackConfig, {
            prefix: id,
            preprocessor: {id, config: {loader: preprocessorLoader}},
          }),
          exclude: /node_modules/
        })
      )
      rules.push(
        rule(`vendor-${id}-pipeline`, {
          test,
          use: createStyleLoaders(rule, server, userWebpackConfig, {
            prefix: `vendor-${id}`,
            preprocessor: {id, config: {loader: preprocessorLoader}},
          }),
          include: /node_modules/
        })
      )
    })
  }

  return rules
}

/**
 * Create rules from rule definitions which may include an id attribute for
 * user customisation. It's assumed these are being created from build config.
 */
export function createExtraRules(extraRules = [], userConfig = {}) {
  let rule = ruleConfigFactory({}, userConfig)
  return extraRules.map(extraRule => {
    let {id, ...ruleConfig} = extraRules
    return rule(id, ruleConfig)
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

  if (server) {
    // HMR is enabled by default but can be explicitly disabled
    if (server.hot !== false) {
      plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
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
    plugins.push(new ExtractTextPlugin({
      filename: cssFilename,
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
        development ? new webpack.NamedModulesPlugin() : new webpack.HashedModuleIdsPlugin(),
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
    plugins.push(new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
    }))
    if (userConfig.uglify !== false) {
      plugins.push(new optimize.UglifyJsPlugin(merge({
        compress: {
          warnings: false,
        },
        output: {
          comments: false,
        },
        sourceMap: true,
      }, userConfig.uglify)))
    }
  }

  // Generate an HTML file for web apps which pulls in generated resources
  if (buildConfig.html) {
    plugins.push(new HtmlPlugin({
      chunksSortMode: 'dependency',
      template: path.join(__dirname, '../templates/webpack-template.html'),
      ...buildConfig.html,
      ...userConfig.html,
    }))
  }

  // Copy static resources
  if (buildConfig.copy) {
    plugins.push(new CopyPlugin(
      ...getCopyPluginArgs(buildConfig.copy, userConfig.copy)
    ))
  }

  // Automatically install missing npm dependencies and add them to package.json
  // Must be enabled with an --install or --auto-install flag
  if (buildConfig.autoInstall) {
    plugins.push(new NpmInstallPlugin({
      peerDependencies: false,
      quiet: true,
      ...userConfig.install,
    }))
  }

  // Insert a banner comment at the top of generated files - used for UMD builds
  if (buildConfig.banner) {
    plugins.push(new webpack.BannerPlugin({banner: buildConfig.banner}))
  }

  // Escape hatch for any extra plugins a particular build ever needs to add
  if (buildConfig.extra) {
    plugins = plugins.concat(buildConfig.extra)
  }

  return plugins
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
 * Create a webpack config with a curated set of default rules suitable for
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
    output: buildOutputConfig,
    polyfill: buildPolyfill,
    plugins: buildPluginConfig = {},
    resolve: buildResolveConfig = {},
    rules: buildRulesConfig = {},
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
  buildRulesConfig.babel = {options: createBabelConfig(buildBabelConfig, userConfig.babel)}

  let webpackConfig = {
    module: {
      rules: createRules(server, buildRulesConfig, userWebpackConfig, nwbPluginConfig)
    },
    output: {
      ...buildOutputConfig,
      ...userOutputConfig,
    },
    plugins: createPlugins(server, buildPluginConfig, userWebpackConfig),
    resolve: merge({
      extensions: ['.js', '.json'],
    }, buildResolveConfig, userResolveConfig),
    ...otherBuildConfig,
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
