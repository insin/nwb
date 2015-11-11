// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

var path = require('path')

var webpack = require('webpack')

var cwd = process.env.ORIGINAL_CWD
var isCi = process.env.CONTINUOUS_INTEGRATION === 'true'
var runCoverage = process.env.COVERAGE === 'true' || isCi

var loaders = [
  {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
]

var reporters = ['dots']

if (runCoverage) {
  loaders.push({test: /\.js$/, include: path.join(cwd, 'src'), loader: 'isparta'})
  reporters.push('coverage')
}

var testFiles = path.join(cwd, 'test/**/*-test.js')

var preprocessors = {}
preprocessors[testFiles] = ['webpack', 'sourcemap']

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
      'node_modules/phantomjs-polyfill/bind-polyfill.js',
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
        fallback: [
          path.join(__dirname, 'node_modules')
        ]
      },
      resolveLoader: {
        modulesDirectories: ['node_modules'],
        root: path.join(__dirname, 'node_modules')
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
