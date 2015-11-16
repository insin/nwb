// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

var path = require('path')

var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var cwd = process.env.ORIGINAL_CWD

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

module.exports = {
  devtool: 'source-map',
  entry: path.join(cwd, 'src/index.js'),
  output: {
    filename: 'app.js',
    path: path.join(cwd, 'public/build'),
    publicPath: 'build/'
  },
  plugins: [
    failBuildOnCompilationError,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
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
          module.resource.indexOf(path.resolve(cwd, 'node_modules')) === 0 &&
          /\.js$/.test(module.resource)
        )
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    })
  ],
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
      {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css?-minimize')},
      {test: /\.(gif|jpe?g|png)$/, loader: 'file?name=[name].[ext]'},
      {test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'file?name=[name].[ext]'},
      {test: /\.json$/, loader: 'json'}
    ]
  }
}
