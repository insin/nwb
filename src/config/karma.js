// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test'
}

import path from 'path'

import glob from 'glob'

import createWebpackConfig from '../createWebpackConfig'

let cwd = process.env.ORIGINAL_CWD
let isCi = process.env.CONTINUOUS_INTEGRATION === 'true'
let runCoverage = process.env.COVERAGE === 'true' || isCi

let testFiles = path.join(cwd, 'tests/**/*-test.js')

let reporters = ['mocha']
let preprocessors = {
  [testFiles]: ['webpack', 'sourcemap']
}

let extraWebpackLoaders = []
if (runCoverage) {
  extraWebpackLoaders.push({
    test: /\.js$/,
    loader: require.resolve('isparta-loader'),
    include: path.join(cwd, 'src')
  })
  reporters.push('coverage')
}

// Find the node_modules directory containing nwb's dependencies
let nodeModules
if (glob.sync('../../node_modules/', {cwd: __dirname}).length > 0) {
  // Global installs and npm@2 local installs have a local node_modules dir
  nodeModules = path.join(__dirname, '../../node_modules')
}
else {
  // Otherwise assume an npm@3 local install, with node_modules as the parent
  nodeModules = path.join(__dirname, '../../../node_modules')
}

let webpackConfig = createWebpackConfig(cwd, {
  server: true,
  devtool: 'inline-source-map',
  loaders: {
    extra: extraWebpackLoaders
  },
  resolve: {
    alias: {
      'src': path.join(cwd, 'src')
    },
    // Fall back to resolve testing dependencies from nwb's dependencies
    fallback: [nodeModules]
  }
})

export default function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha'],
    reporters,
    coverageReporter: {
      dir: path.join(cwd, 'coverage'),
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: '.'}
      ]
    },
    files: [
      path.join(nodeModules, 'phantomjs-polyfill/bind-polyfill.js'),
      path.join(cwd, 'tests/**/*-test.js')
    ],
    preprocessors,
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    },
    singleRun: isCi
  })
}
