// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

var path = require('path')

var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var cwd = process.env.ORIGINAL_CWD
var pkg = require(path.join(cwd, 'package.json'))

module.exports = {
  devtool: 'source-map',
  entry: path.join(cwd, 'demo/src/index.js'),
  output: {
    filename: 'demo.js',
    path: path.join(cwd, 'demo/dist')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      title: pkg.name + ' ' + pkg.version + ' Demo'
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
