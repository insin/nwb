// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

var path = require('path')

var webpack = require('webpack')

var cwd = process.env.ORIGINAL_CWD
var pkg = require('./getPackage')(cwd)

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.BannerPlugin(
    pkg.name + ' ' + pkg.version + ' - ' + pkg.homepage + '\n' +
    pkg.license + ' Licensed'
  )
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  )
}

module.exports = {
  entry: path.join(cwd, 'src/index.js'),
  output: {
    filename: pkg.name + (process.env.NODE_ENV === 'production' ? '.min.js' : '.js'),
    library: pkg.global,
    libraryTarget: 'umd',
    path: path.join(cwd, 'umd')
  },
  externals: pkg.externals,
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.json'],
    modulesDirectories: ['node_modules']
  },
  resolveLoader: {
    modulesDirectories: ['node_modules'],
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.json$/, loader: 'json'}
    ]
  }
}
