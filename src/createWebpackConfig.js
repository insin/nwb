import path from 'path'

import combineLoaders from 'webpack-combine-loaders'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import webpack, {optimize} from 'webpack'

/**
 * Merge webpack loader config ({test: ..., loader: ..., query: ...}) objects.
 */
export function mergeLoaderConfig(defaultConfig = {}, buildConfig = {}, userConfig = {}) {
  if (!defaultConfig && !buildConfig && !userConfig) {
    return null
  }

  // TODO Intelligent merging instead of... this
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
 * Force the build to fail by exiting with a non-zero code when there are
 * compilation errors.
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

export function createStyleLoader(loader, server) {
  let loaders = [
    loader('css', {
      loader: require.resolve('css-loader'),
      query: {
        minimize: false
      }
    }),
    loader('autoprefixer', {
      loader: require.resolve('autoprefixer-loader')
    })
  ]

  if (server) {
    loaders.unshift(loader('style', {
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
    {
      test: /\.css$/,
      loader: createStyleLoader(loader, server)
    },
    loader('graphics', {
      test: /\.(gif|png)$/,
      loader: require.resolve('url-loader'),
      query: {
        limit: 10240
      }
    }),
    loader('jpg', {
      test: /\.jpe?g$/,
      loader: require.resolve('file-loader')
    }),
    loader('font', {
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
    })
  ]
}

export function createPlugins(server, cwd, {
  appStyle, banner, define, style, vendorJS, vendorStyle
} = {}) {
  var plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      ...define
    }),
    new optimize.DedupePlugin(),
    new optimize.OccurenceOrderPlugin()
  ]

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

  // Move JavaScript imported from node_modules into a vendor bundle
  if (vendorJS) {
    plugins.push(new optimize.CommonsChunkPlugin({
      name: vendorJS,
      filename: vendorJS,
      minChunks: function(module, count) {
        return (
          module.resource &&
          module.resource.indexOf(path.resolve(cwd, 'node_modules')) === 0 &&
          /\.js$/.test(module.resource)
        )
      }
    }))
  }

  // // Move styles imported from node_modules into a vendor stylesheet
  // if (vendorStyle) {
  //   plugins.push(new optimize.CommonsChunkPlugin({
  //     name: vendorStyle,
  //     filename: vendorStyle,
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

  if (banner) {
    plugins.push(new webpack.BannerPlugin(banner))
  }

  return plugins
}

/**
 * Create a webpack config with a curated set of default loaders suitable for
 * creating a static build (default) or serving an app with hot reloading.
 */
export default function createWebpackConfig(cwd, {
  loaders = {}, plugins = {}, resolve = {}, server = false, userConfig = {}, ...otherConfig
} = {}) {
  return {
    module: {
      loaders: createLoaders(server, loaders, userConfig.loaders)
    },
    plugins: createPlugins(server, cwd, plugins),
    resolve: {
      extensions: ['', '.js', '.jsx', '.json'],
      ...resolve
    },
    ...otherConfig
  }
}
