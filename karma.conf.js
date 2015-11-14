// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

var path = require('path')

var glob = require('glob')
var webpack = require('webpack')

var cwd = process.env.ORIGINAL_CWD
var isCi = process.env.CONTINUOUS_INTEGRATION === 'true'
var runCoverage = process.env.COVERAGE === 'true' || isCi

var loaders = [
  {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
  {test: /\.css$/, loader: 'null'},
  {test: /\.(gif|jpe?g|png)$/, loader: 'file?name=[name].[ext]'},
  {test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'file?name=[name].[ext]'},
  {test: /\.json$/, loader: 'json'}
]

var reporters = ['dots']

if (runCoverage) {
  loaders.push({test: /\.js$/, include: path.join(cwd, 'src'), loader: 'isparta'})
  reporters.push('coverage')
}

var testFiles = path.join(cwd, 'test/**/*-test.js')

var preprocessors = {}
preprocessors[testFiles] = ['webpack', 'sourcemap']

// Find the node_modules directory containing nwb's dependencies
var nodeModules
if (glob.sync('./node_modules').length > 0) {
  // Global installs and npm@2 local installs have a local node_modules dir
  nodeModules = path.join(__dirname, 'node_modules')
}
else {
  // Otherwise assume an npm@3 local install, with node_modules as the parent
  nodeModules = path.join(__dirname, '../../node_modules')
}

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['tap'],
    reporters: reporters,
    coverageReporter: {
      dir: path.join(cwd, 'coverage'),
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: '.'}
      ]
    },
    files: [
      path.join(nodeModules, 'phantomjs-polyfill/bind-polyfill.js'),
      path.join(cwd, 'test/**/*-test.js')
    ],
    preprocessors: preprocessors,
    webpack: {
      devtool: 'inline-source-map',
      node: {
        fs: 'empty'
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
      ],
      resolve: {
        alias: {
          'src': path.join(cwd, 'src')
        },
        extensions: ['', '.js', '.json'],
        modulesDirectories: ['node_modules'],
        // Resolve testing dependencies from nwb's dependencies
        fallback: [nodeModules]
      },
      resolveLoader: {
        modulesDirectories: ['node_modules'],
        // Resolve Webpack loaders from nwb's dependencies
        root: nodeModules
      },
      module: {
        loaders: loaders
      }
    },
    webpackServer: {
      noInfo: true
    },
    singleRun: isCi
  })
}
