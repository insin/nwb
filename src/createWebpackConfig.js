// @flow
import path from 'path'

import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import NpmInstallPlugin from '@insin/npm-install-webpack-plugin'
import webpack from 'webpack'
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

const DEFAULT_UGLIFY_CONFIG = {
  cache: true,
  parallel: true,
  sourceMap: true,
}

function createUglifyConfig(userWebpackConfig) {
  if (userWebpackConfig.debug) {
    return merge(
      DEFAULT_UGLIFY_CONFIG,
      {
        uglifyOptions: {
          output: {
            beautify: true,
          },
          mangle: false,
        }
      },
      // Preserve user 'compress' config if present, as it affects what gets
      // removed from the production build.
      typeof userWebpackConfig.uglify === 'object' &&
      typeof userWebpackConfig.uglify.uglifyConfig === 'object' &&
      'compress' in userWebpackConfig.uglify.uglifyConfig
        ? {uglifyOptions: {compress: userWebpackConfig.uglify.uglifyConfig.compress}}
        : {}
    )
  }
  return merge(
    DEFAULT_UGLIFY_CONFIG,
    typeof userWebpackConfig.uglify === 'object' ? userWebpackConfig.uglify : {}
  )
}

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
    options: {
      // Only enable style-loader HMR when we're serving a development build
      hmr: Boolean(server),
    }
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
        ident: name('postcss'),
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

  if (server || userWebpackConfig.extractCSS === false) {
    loaders.unshift(styleLoader)
    return loaders
  }
  else {
    loaders.unshift(createLoader(name('extract-css'), {
      loader: MiniCssExtractPlugin.loader,
    }))
    return loaders
  }
}

/**
 * Create style rules. By default, creates a single rule for .css files and for
 * any style preprocessor plugins present. The user can configure this to create
 * multiple rules if needed.
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

  // Add rules with chained style loaders, using MiniCssExtractPlugin for builds
  if (userWebpackConfig.styles !== false) {
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
 * Plugin for HtmlPlugin which inlines the Webpack runtime code and chunk
 * manifest into the HTML in a <script> tag before other emitted asssets are
 * injected by HtmlPlugin itself.
 */
function inlineRuntimePlugin() {
  this.hooks.compilation.tap('inlineRuntimePlugin', compilation => {
    compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('inlineRuntimePlugin', (data, cb) => {
      Object.keys(compilation.assets).forEach(key => {
        if (!/^runtime\.[a-z\d]+\.js$/.test(key)) return
        let {children} = compilation.assets[key]
        if (children && children[0]) {
          data.html = data.html.replace(
            /^(\s*)<\/body>/m,
            `$1<script>${children[0]._value}</script>\n$1</body>`
          )
          // Remove the runtime from HtmlPlugin's assets to prevent a <script>
          // tag being created for it.
          var runtimeIndex = data.assets.js.indexOf(data.assets.publicPath + key)
          data.assets.js.splice(runtimeIndex, 1)
          delete data.assets.chunks.runtime
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
  let production = process.env.NODE_ENV === 'production'

  let optimization = {}
  let plugins = [
    // Enforce case-sensitive import paths
    new CaseSensitivePathsPlugin(),
    // Replace specified expressions with values
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...buildConfig.define,
      ...userConfig.define,
    }),
    // XXX Workaround until loaders migrate away from using this.options
    new webpack.LoaderOptionsPlugin({
      options: {
        context: process.cwd()
      }
    })
  ]

  if (server) {
    // HMR is enabled by default but can be explicitly disabled
    if (server.hot !== false) {
      plugins.push(new webpack.HotModuleReplacementPlugin())
      optimization.noEmitOnErrors = true
    }
    if (buildConfig.status) {
      plugins.push(new StatusPlugin(buildConfig.status))
    }
  }
  // If we're not serving, we're creating a static build
  else {
    if (userConfig.extractCSS !== false) {
      // Extract imported stylesheets out into .css files
      plugins.push(new MiniCssExtractPlugin({
        filename: production ? `[name].[chunkhash:8].css` : '[name].css',
        ...userConfig.extractCSS,
      }))
    }

    // Move modules imported from node_modules/ into a vendor chunk when enabled
    if (buildConfig.vendor) {
      optimization.splitChunks = {
        // Split the entry chunk too
        chunks: 'all',
        // A 'vendors' cacheGroup will get defaulted if it doesn't exist, so
        // we override it to explicitly set the chunk name.
        cacheGroups: {
          vendors: {
            name: 'vendor',
            priority: -10,
            test: /[\\/]node_modules[\\/]/,
          }
        }
      }
    }
  }

  if (production) {
    plugins.push(new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
    }))
    optimization.minimize = buildConfig.uglify !== false && userConfig.uglify !== false
    if (buildConfig.uglify !== false && userConfig.uglify !== false) {
      optimization.minimizer = [{
        apply(compiler: any) {
          // Lazy load the uglifyjs plugin
          let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
          new UglifyJsPlugin(createUglifyConfig(userConfig)).apply(compiler)
        }
      }]
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
    // Extract the Webpack runtime and manifest into its own chunk
    // The default runtime chunk name is 'runtime' with this configuration
    optimization.runtimeChunk = 'single'
    // Inline the runtime and manifest
    plugins.push(inlineRuntimePlugin)
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

  return {optimization, plugins}
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
  buildRulesConfig.babel = {options: createBabelConfig(buildBabelConfig, userConfig.babel, userConfig.path)}

  let webpackConfig = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    module: {
      rules: createRules(server, buildRulesConfig, userWebpackConfig, pluginConfig),
      strictExportPresence: true,
    },
    output: {
      ...buildOutputConfig,
      ...userOutputConfig,
    },
    performance: {
      hints: false
    },
    // Plugins are configured via a 'plugins' list and 'optimization' config
    ...createPlugins(server, buildPluginConfig, userWebpackConfig),
    resolve: merge(buildResolveConfig, userResolveConfig),
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
