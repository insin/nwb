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

import combineLoaders from 'webpack-combine-loaders'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack, {optimize} from 'webpack'

/**
 * Merge webpack loader config ({test, loader, query, inclue, exclude}) objects.
 */
export function mergeLoaderConfig(defaultConfig = {}, buildConfig = {}, userConfig = {}) {
  // TODO Intelligent merging instead of this dumb overriding/query merging
  return {
    test: userConfig.test || buildConfig.test || defaultConfig.test,
    loader: userConfig.loader || buildConfig.loader || defaultConfig.loader,
    include: userConfig.include || buildConfig.include || defaultConfig.include,
    exclude: userConfig.exclude || buildConfig.exclude || defaultConfig.exclude,
    query: {
      ...defaultConfig.query,
      ...buildConfig.query,
      ...userConfig.query
    }
  }
}

/**
 * Create a function which configures a loader identified by a unique id, with
 * the option to override defaults with build-specific and user config.
 */
export let loaderConfigFactory = (buildConfig, userConfig) =>
  (id, defaultConfig) =>
    ({id, ...mergeLoaderConfig(defaultConfig, buildConfig[id], userConfig[id])})

/**
 * Create a default style-handling pipeline for either a static build (default)
 * or a server build.
 */
export function createStyleLoader(loader, server, prefix) {
  let name = (name) => prefix ? `${prefix}-${name}` : name
  let loaders = [
    loader(name('css'), {
      loader: require.resolve('css-loader')
    }),
    loader(name('autoprefixer'), {
      loader: require.resolve('autoprefixer-loader')
    })
  ]

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

export function createLoaders(server, buildConfig = {}, userConfig = {}) {
  let loader = loaderConfigFactory(buildConfig, userConfig)

  return [
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
      loader: createStyleLoader(loader, server, 'vendor'),
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
      test: /\.()(\?v=\d+\.\d+\.\d+)?$/,
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
    // Undocumented escape hatches for adding new loaders
    ...buildConfig._extra || [],
    ...userConfig._extra || []
  ]
}

/**
 * A webpack plugin which forces the build to fail by exiting with a non-zero
 * code when there are compilation errors. This is intended for use on a CI
 * server which is running webpack builds.
 */
export function failBuildOnCompilationError() {
  this.plugin('done', ({compilation}) => {
    if (compilation.errors && compilation.errors.length > 0) {
      console.error('webpack build failed:')
      compilation.errors.forEach(error => console.error(error.message))
      process.exit(1)
    }
  })
}

export function createPlugins(server, cwd, {
  // File name to use for extracted CSS - only applicable for server builds
  appStyle,
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
  // Name to use for a vendor JavaScript chunk - providing a name causes it to
  // be created.
  vendorJS
  // TODO Name to use for a vendor CSS chunk
  // vendorStyle
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

  if (!server && appStyle) {
    plugins.push(new ExtractTextPlugin(appStyle))
  }

  // Move JavaScript imported from node_modules into a vendor chunk
  if (vendorJS) {
    plugins.push(new optimize.CommonsChunkPlugin({
      name: vendorJS,
      filename: `${vendorJS}.js`,
      minChunks: function(module, count) {
        return (
          module.resource &&
          module.resource.indexOf(path.resolve(cwd, 'node_modules')) === 0 &&
          /\.js$/.test(module.resource)
        )
      }
    }))
  }

  // TODO Move CSS imported from node_modules into a vendor chunk
  // if (vendorStyle) {
  //   plugins.push(new optimize.CommonsChunkPlugin({
  //     name: vendorStyle,
  //     filename: `${vendorStyle}.css`,
  //     minChunks: function(module, count) {
  //       return (
  //         module.resource &&
  //         module.resource.indexOf(path.resolve(cwd, 'node_modules')) === 0 &&
  //         /\.(css|less|scss|styl)$/.test(module.resource)
  //       )
  //     }
  //   }))
  // }

  if (process.env.NODE_ENV === 'production') {
    plugins.push(new optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }))
  }

  if (html) {
    plugins.push(new HtmlWebpackPlugin(html))
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
 * Create a webpack config with a curated set of default loaders suitable for
 * creating a static build (default) or serving an app with hot reloading.
 */
export default function createWebpackConfig(cwd, {
  loaders = {},
  plugins = {},
  resolve = {},
  server = false,
  userConfig = {},
  ...otherConfig
} = {}) {
  assert.equal(typeof cwd, 'string')
  return {
    module: {
      loaders: createLoaders(server, loaders, userConfig.loaders)
    },
    plugins: createPlugins(server, cwd, plugins),
    resolve: {
      extensions: ['', '.web.js', '.js', '.jsx', '.json'],
      ...resolve
    },
    ...otherConfig
  }
}
