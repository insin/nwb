// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

var path = require('path')

var webpack = require('webpack')

var cwd = process.env.ORIGINAL_CWD
var pkg = require(path.join(cwd, 'package.json'))

// Validate package.json
var REQUIRED_CONFIG = ['name', 'version', 'homepage', 'license', 'global']
var missing = REQUIRED_CONFIG.filter(function(field) { return !pkg[field] })
if (missing.length > 0) {
  console.error('Required UMD build fields missing from package.json: ' + missing.join(', '))
  process.exit(1)
}
if (pkg.externals && Object.prototype.toString.call(pkg.externals) !== '[object Object]') {
  console.error('UMD build externals field in package.json must be an Object')
  process.exit(1)
}

var externals = {}
// Expand a {package: global} object into a webpack externals object
if (pkg.externals) {
  externals = Object.keys(pkg.externals).reduce(function(externals, packageName) {
    var globalName = pkg.externals[packageName]
    externals[packageName] = {
      root: globalName,
      commonjs2: packageName,
      commonjs: packageName,
      amd: packageName
    }
    return externals
  }, {})
}

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
  externals: externals,
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
      {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: 'null'},
      {test: /\.json$/, loader: 'json'}
    ]
  }
}
