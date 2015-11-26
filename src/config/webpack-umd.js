// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

import path from 'path'

import webpack from 'webpack'

let cwd = process.env.ORIGINAL_CWD
let pkg = require(path.join(cwd, 'package.json'))

// Validate package.json
const REQUIRED_CONFIG = ['name', 'version', 'homepage', 'license', 'global']
let missing = REQUIRED_CONFIG.filter(field => !pkg[field])
if (missing.length > 0) {
  console.error(`Required UMD build fields missing from package.json: ${missing.join(', ')}`)
  process.exit(1)
}
if (pkg.externals && Object.prototype.toString.call(pkg.externals) !== '[object Object]') {
  console.error('UMD build externals field in package.json must be an Object')
  process.exit(1)
}

let externals = {}
// Expand a {package: global} object into a webpack externals object
if (pkg.externals) {
  externals = Object.keys(pkg.externals).reduce((externals, packageName) => {
    let globalName = pkg.externals[packageName]
    externals[packageName] = {
      root: globalName,
      commonjs2: packageName,
      commonjs: packageName,
      amd: packageName
    }
    return externals
  }, {})
}

let plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.BannerPlugin(
    `${pkg.name} ${pkg.version} - ${pkg.homepage}\n${pkg.license} Licensed`
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

let outputExt = (process.env.NODE_ENV === 'production' ? 'min.js' : 'js')

export default {
  entry: path.join(cwd, 'src/index.js'),
  output: {
    filename: `${pkg.name}.${outputExt}`,
    library: pkg.global,
    libraryTarget: 'umd',
    path: path.join(cwd, 'umd')
  },
  externals,
  plugins,
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
      // TODO Revisit
      {test: /\.css$/, loader: 'null'},
      {test: /\.json$/, loader: 'json'}
    ]
  }
}
