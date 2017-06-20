// @flow
import path from 'path'

import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import NpmInstallPlugin from 'npm-install-webpack2-plugin' // XXX Temporary
import webpack, {optimize} from 'webpack'
import merge from 'webpack-merge'

import createBabelConfig from './createBabelConfig'
import debug from './debug'
import {UserError} from './errors'
import {deepToString, replaceArrayMerge, typeOf} from './utils'
import StatusPlugin from './WebpackStatusPlugin'

type LoaderConfig = {
  loader?: string,
  options?: Object
};

type LoaderConfigFactory = (id: ?string, defaultConfig: LoaderConfig) => LoaderConfig;

type UseConfig = Array<string | LoaderConfig>;

type RuleConfig = {
  test?: RegExp,
  include?: RegExp,
  exclude?: RegExp,
  loader?: string,
  options?: Object,
  use?: UseConfig
};

type RuleConfigFactory = (?string, RuleConfig) => ?RuleConfig;

/**
 * Merge webpack rule config objects.
 */
export function mergeRuleConfig(
  defaultConfig: RuleConfig,
  buildConfig: RuleConfig = {},
  userConfig: RuleConfig = {}
): RuleConfig {
  let rule
  // Omit the default loader and options if the user is configuring their own
  if (defaultConfig.loader && (userConfig.loader || userConfig.use)) {
    let {
      loader: defaultLoader, options: defaultOptions, // eslint-disable-line no-unused-vars
      ...defaultRuleConfig
    } = defaultConfig
    rule = merge(defaultRuleConfig, userConfig)
  }
  else {
    rule = replaceArrayMerge(defaultConfig, buildConfig, userConfig)
  }
  if (rule.options && Object.keys(rule.options).length === 0) {
    delete rule.options
  }
  return rule
}

/**
 * Merge webpack loader config objects.
 */
export function mergeLoaderConfig(
  defaultConfig: LoaderConfig,
  buildConfig: LoaderConfig = {},
  userConfig: LoaderConfig = {}
): RuleConfig {
  let loader
  // If the loader is being changed, only use the provided config
  if (userConfig.loader) {
    loader = {...userConfig}
  }
  else {
    // The only arrays used in default options are for PostCSS plugins, which we
    // want the user to be able to completely override.
    loader = replaceArrayMerge(defaultConfig, buildConfig, userConfig)
  }
  if (loader.options && Object.keys(loader.options).length === 0) {
    delete loader.options
  }
  return loader
}

/**
 * Create a function which configures a rule identified by a unique id, with
 * the option to override defaults with build-specific and user config.
 */
export function createRuleConfigFactory(
  buildConfig: {[key: string]: RuleConfig} = {},
  userConfig: {[key: string]: RuleConfig} = {}
): RuleConfigFactory {
  return function(id: ?string, defaultConfig: RuleConfig): ?RuleConfig {
    if (id) {
      // Allow the user to turn off rules by configuring them with false
      if (userConfig[id] === false) {
        return null
      }
      let rule = mergeRuleConfig(defaultConfig, buildConfig[id], userConfig[id])
      return rule
    }
    return defaultConfig
  }
}

/**
 * Create a function which configures a loader identified by a unique id, with
 * the option to override defaults with build-specific and user config.
 */
export function createLoaderConfigFactory(
  buildConfig: {[key: string]: LoaderConfig} = {},
  userConfig: {[key: string]: LoaderConfig} = {}
): LoaderConfigFactory {
  return function (id: ?string, defaultConfig: LoaderConfig): LoaderConfig {
    if (id) {
      let loader = mergeLoaderConfig(defaultConfig, buildConfig[id], userConfig[id])
      return loader
    }
    return defaultConfig
  }
}

/**
 * Create a function which applies a prefix to a name when a prefix is given,
 * unless the prefix ends with the name, in which case the prefix itself is
 * returned.
 * The latter rule is to allow rules created for CSS preprocessor plugins to
 * be given unique ids for user configuration without duplicating the name of
 * the rule.
 * e.g.: loaderConfigName('sass')('css') => 'sass-css'
 *       loaderConfigName('sass')('sass') => 'sass' (as opposed to 'sass-sass')
 */
export let loaderConfigName = (prefix: ?string) =>
  (name: string): string => {
    if (prefix && prefix.endsWith(name)) {
      return prefix
    }
    return prefix ? `${prefix}-${name}` : name
  }

/**
 * Create a list of chained loader config objects for a static build (default)
 * or serving.
 */
export function createStyleLoaders(
  createLoader: (?string, LoaderConfig) => LoaderConfig,
  userWebpackConfig: Object,
  options: {
    preprocessor?: ?Object,
    prefix?: ?string,
    server?: ?boolean
  } = {},
): UseConfig {
  let {
    preprocessor = null,
    prefix = null,
    server = false,
  } = options
  let name = loaderConfigName(prefix)
  let styleLoader = createLoader(name('style'), {
    loader: require.resolve('style-loader'),
  })
  let loaders = [
    createLoader(name('css'), {
      loader: require.resolve('css-loader'),
      options: {
        // Apply postcss-loader to @imports
        importLoaders: 1,
      },
    }),
    createLoader(name('postcss'), {
      loader: require.resolve('postcss-loader'),
      options: {
        plugins: createDefaultPostCSSPlugins(userWebpackConfig),
      }
    })
  ]

  if (preprocessor) {
    loaders.push(createLoader(
      preprocessor.id ? name(preprocessor.id) : null,
      preprocessor.config
    ))
  }

  if (server) {
    loaders.unshift(styleLoader)
    return loaders
  }
  else {
    return ExtractTextPlugin.extract({
      fallback: styleLoader,
      use: loaders,
    })
  }
}

/**
 * Create style rules for nwb >= 0.16.
 */
function createStyleRules(
  server: boolean,
  userWebpackConfig: Object,
  pluginConfig: Object,
  createRule: RuleConfigFactory,
  createLoader: LoaderConfigFactory
): Array<?RuleConfig> {
  let styleConfig = userWebpackConfig.styles || {}
  let styleRules = []

  // Configured styles rules, with individual loader configuration as part of
  // the definition.
  Object.keys(styleConfig).forEach(type => {
    let test, preprocessor
    if (type === 'css') {
      test = /\.css$/
    }
    else {
      let preprocessorConfig = pluginConfig.cssPreprocessors[type]
      test = preprocessorConfig.test
      preprocessor = {id: null, config: {loader: preprocessorConfig.loader}}
    }
    let ruleConfigs = [].concat(...styleConfig[type])
    ruleConfigs.forEach(ruleConfig => {
      let {loaders: loaderConfig, ...topLevelRuleConfig} = ruleConfig
      // Empty build config, as all loader config for custom style rules will be
      // provided by the user.
      let styleRuleLoader = createLoaderConfigFactory({}, loaderConfig)
      styleRules.push({
        test,
        use: createStyleLoaders(styleRuleLoader, userWebpackConfig, {preprocessor, server}),
        ...topLevelRuleConfig,
      })
    })
  })

  // Default CSS rule when nothing is configured, tweakable via webpack.rules by
  // unique id.
  if (!('css' in styleConfig)) {
    styleRules.push(
      createRule('css-rule', {
        test: /\.css$/,
        use: createStyleLoaders(createLoader, userWebpackConfig, {server}),
      })
    )
  }

  // Default rule for each CSS preprocessor plugin when nothing is configured,
  // tweakable via webpack.rules by unique id.
  if (pluginConfig.cssPreprocessors) {
    Object.keys(pluginConfig.cssPreprocessors).forEach(id => {
      if (id in styleConfig) return
      let {test, loader: preprocessorLoader} = pluginConfig.cssPreprocessors[id]
      styleRules.push(
        createRule(`${id}-rule`, {
          test,
          use: createStyleLoaders(createLoader, userWebpackConfig, {
            prefix: id,
            preprocessor: {id, config: {loader: preprocessorLoader}},
            server,
          })
        })
      )
    })
  }

  return styleRules
}

// TODO Remove in a future version
/**
 * Create default style rules for nwb < 0.16.
 */
function createLegacyStyleRules(
  server: boolean,
  userWebpackConfig: Object,
  pluginConfig: Object,
  createRule: RuleConfigFactory,
  createLoader: LoaderConfigFactory
): Array<?RuleConfig> {
  let styleRules = [
    createRule('css-pipeline', {
      test: /\.css$/,
      use: createStyleLoaders(createLoader, userWebpackConfig, {server}),
      exclude: /node_modules/,
    }),
    createRule('vendor-css-pipeline', {
      test: /\.css$/,
      use: createStyleLoaders(createLoader, userWebpackConfig, {prefix: 'vendor', server}),
      include: /node_modules/,
    })
  ]

  if (pluginConfig.cssPreprocessors) {
    Object.keys(pluginConfig.cssPreprocessors).forEach(id => {
      let {test, loader: preprocessorLoader} = pluginConfig.cssPreprocessors[id]
      styleRules.push(
        createRule(`${id}-pipeline`, {
          test,
          use: createStyleLoaders(createLoader, userWebpackConfig, {
            prefix: id,
            preprocessor: {id, config: {loader: preprocessorLoader}},
            server,
          }),
          exclude: /node_modules/
        }),
        createRule(`vendor-${id}-pipeline`, {
          test,
          use: createStyleLoaders(createLoader, userWebpackConfig, {
            prefix: `vendor-${id}`,
            preprocessor: {id, config: {loader: preprocessorLoader}},
            server,
          }),
          include: /node_modules/
        })
      )
    })
  }

  return styleRules
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
export function createRules(
  server: boolean,
  buildConfig: Object = {},
  userWebpackConfig: Object = {},
  pluginConfig: Object = {}
) {
  let createRule = createRuleConfigFactory(buildConfig, userWebpackConfig.rules)
  let createLoader = createLoaderConfigFactory(buildConfig, userWebpackConfig.rules)

  // Default options for url-loader
  let urlLoaderOptions = {
    // Don't inline anything by default
    limit: 1,
    // Always use a hash to prevent files with the same name causing issues
    name: '[name].[hash:8].[ext]',
  }

  let rules = [
    createRule('babel', {
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
    createRule('graphics', {
      test: /\.(gif|png|webp)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    createRule('svg', {
      test: /\.svg$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    createRule('jpeg', {
      test: /\.jpe?g$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    createRule('fonts', {
      test: /\.(eot|otf|ttf|woff|woff2)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    createRule('video', {
      test: /\.(mp4|ogg|webm)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    createRule('audio', {
      test: /\.(wav|mp3|m4a|aac|oga)$/,
      loader: require.resolve('url-loader'),
      options: {...urlLoaderOptions},
    }),
    // Extra rules from build config, still configurable via user config when
    // the rules specify an id.
    ...createExtraRules(buildConfig.extra, userWebpackConfig.rules),
  ]

  // Add rules with chained style loaders, using ExtractTextPlugin for builds
  if (userWebpackConfig.styles === 'old') {
    // nwb <= 0.15 default
    rules = rules.concat(createLegacyStyleRules(
      server, userWebpackConfig, pluginConfig, createRule, createLoader
    ))
  }
  else if (userWebpackConfig.styles !== false) {
    rules = rules.concat(createStyleRules(
      server, userWebpackConfig, pluginConfig, createRule, createLoader
    ))
  }

  return rules.filter(rule => rule != null)
}

/**
 * Create rules from rule definitions which may include an id attribute for
 * user customisation. It's assumed these are being created from build config.
 */
export function createExtraRules(
  extraRules: Object[] = [],
  userConfig: Object = {}
): Array<?RuleConfig> {
  let createRule = createRuleConfigFactory({}, userConfig)
  return extraRules.map(extraRule => {
    let {id, ...ruleConfig} = extraRule
    return createRule(id, ruleConfig)
  })
}

/**
 * Plugin for HtmlPlugin which inlines content for an extracted Webpack manifest
 * into the HTML in a <script> tag before other emitted asssets are injected by
 * HtmlPlugin itself.
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
          // Remove the manifest from HtmlPlugin's assets to prevent a <script>
          // tag being created for it.
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
export function createPlugins(
  server: boolean,
  buildConfig: Object = {},
  userConfig: Object = {}
) {
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
      allChunks: true,
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
        // HashedModuleIdsPlugin does this without adding too much to bundle
        // size and NamedModulesPlugin allows for easier debugging of
        // development builds.
        development ? new webpack.NamedModulesPlugin() : new webpack.HashedModuleIdsPlugin(),
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
    // Use partial scope hoisting/module concatenation
    if (userConfig.hoisting) {
      plugins.push(new optimize.ModuleConcatenationPlugin())
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
  // if present.
  // Must be enabled with an --install or --auto-install flag.
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
  intl(options: {locales: string[]}) {
    return {
      plugins: [
        new webpack.ContextReplacementPlugin(
          /intl[/\\]locale-data[/\\]jsonp$/,
          new RegExp(`^\\.\\/(${options.locales.join('|')})$`)
        )
      ]
    }
  },
  moment(options: {locales: string[]}) {
    return {
      plugins: [
        new webpack.ContextReplacementPlugin(
          /moment[/\\]locale$/,
          new RegExp(`^\\.\\/(${options.locales.join('|')})$`)
        )
      ]
    }
  },
  'react-intl'(options: {locales: string[]}) {
    return {
      plugins: [
        new webpack.ContextReplacementPlugin(
          /react-intl[/\\]locale-data$/,
          new RegExp(`^\\.\\/(${options.locales.join('|')})$`)
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
export function getCompatConfig(userCompatConfig: Object = {}): ?Object {
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
export default function createWebpackConfig(
  buildConfig: Object,
  pluginConfig: Object = {},
  userConfig: Object = {}
): Object {
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
      rules: createRules(server, buildRulesConfig, userWebpackConfig, pluginConfig),
      strictExportPresence: true,
    },
    output: {
      ...buildOutputConfig,
      ...userOutputConfig,
    },
    plugins: createPlugins(server, buildPluginConfig, userWebpackConfig),
    resolve: merge({
      extensions: ['.js', '.json'],
    }, buildResolveConfig, userResolveConfig),
    resolveLoader: {
      modules: ['node_modules', path.join(__dirname, '../node_modules')],
    },
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

  // Finally, give them a chance to do whatever they want with the generated
  // config.
  if (typeOf(userWebpackConfig.config) === 'function') {
    webpackConfig = userWebpackConfig.config(webpackConfig)
    if (!webpackConfig) {
      throw new UserError(`webpack.config() in ${userConfig.path} didn't return anything - it must return the Webpack config object.`)
    }
  }

  return webpackConfig
}
