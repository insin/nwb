var path = require('path')

var assign = require('object-assign')
var webpack = require('webpack')
var combineLoaders = require('webpack-combine-loaders')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

function failBuildOnCompilationError() {
  this.plugin('done', function(stats) {
    if (stats.compilation.errors && stats.compilation.errors.length > 0) {
      console.error('webpack build failed:')
      stats.compilation.errors.forEach(function(error) {
        console.error(error.message)
      })
      process.exit(1)
    }
  })
}

module.exports = function(options, userConfig) {
  function loader(name, loader, defaultQuery) {
    if (!userConfig.loaderQuery || !userConfig.loaderQuery[loader.loader]) {
      loader.query = defaultQuery || {}
      return loader
    }
    loader.query = assign({}, defaultQuery, userConfig.loaderQuery[loader.loader])
    return loader
  }

  var babelLoaderQuery = {
    loose: 'all'
  }

  var plugins = [
    failBuildOnCompilationError,
    new webpack.DefinePlugin(assign({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }, userConfig.define || {})),
    new ExtractTextPlugin('style.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    // Move anything imported from node_modules into a vendor bundle
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      minChunks: function(module, count) {
        return (
          module.resource &&
          module.resource.indexOf(path.resolve(options.cwd, 'node_modules')) === 0 &&
          /\.js$/.test(module.resource)
        )
      }
    })
  ]

  if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }))
    // Enable Babel optimisations for React apps
    if (options.react) {
      babelLoaderQuery.optional = [
        'optimisation.react.inlineElements',
        'optimisation.react.constantElements'
      ]
    }
  }

  return {
    devtool: 'source-map',
    entry: path.join(options.cwd, 'src/index.js'),
    output: {
      filename: 'app.js',
      path: path.join(options.cwd, 'public/build'),
      publicPath: 'build/'
    },
    plugins: plugins,
    resolve: {
      extensions: ['', '.js', '.jsx', '.json'],
      modulesDirectories: ['node_modules']
    },
    resolveLoader: {
      modulesDirectories: ['node_modules'],
      root: path.join(__dirname, 'node_modules')
    },
    module: {
      loaders: [
        loader({test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/}, babelLoaderQuery),
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract(combineLoaders([
            loader({loader: 'css'}, {
              minimize: false
            })
          ]))
        },
        loader({test: /\.(gif|jpe?g|png)$/, loader: 'file'}, {
          name: '[name].[ext]'
        }),
        loader({test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'file'}, {
          name: '[name].[ext]'
        }),
        loader({test: /\.json$/, loader: 'json'})
      ]
    }
  }
}
