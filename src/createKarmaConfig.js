import path from 'path'

import merge from 'webpack-merge'

import createWebpackConfig from './createWebpackConfig'
import debug from './debug'
import {UserError} from './errors'
import {deepToString, typeOf} from './utils'

// The following defaults are combined into a single extglob-style pattern to
// avoid generating "pattern ... does not match any file" warnings.

// Exclude top-level test dirs and __tests__ dirs under src/ from code coverage
// by default.
const DEFAULT_EXCLUDE_FROM_COVERAGE = ['test/', 'tests/', 'src/**/__tests__/']
// Not every file in a test directory is a test and tests may also be co-located
// with the code they test, so determine test files by suffix.
const DEFAULT_TEST_FILES = ['+(src|test?(s))/**/*+(.spec|.test).js']

/**
 * Browser, framework and reporter config can be passed as strings or as plugin
 * objects. This handles figuring out which names and plugins have been provided
 * and automatically extracting the first browser/framework/reporter name from a
 * plugin object.
 */
export function processPluginConfig(configs) {
  let names = []
  let plugins = []
  configs.forEach(config => {
    if (typeOf(config) === 'string') {
      names.push(config)
    }
    else {
      names.push(Object.keys(config)[0].split(':').pop())
      plugins.push(config)
    }
  })
  return [names, plugins]
}

/**
 * Finds a karma plugin with the given type:name id. If a plugin object contains
 * multiple plugins (e.g. karma-chai-plugins), only the first will be checked.
 */
export function findPlugin(plugins, findId) {
  for (let i = 0, l = plugins.length; i < l; i++) {
    if (typeOf(plugins[i]) !== 'object') {
      continue
    }
    if (Object.keys(plugins[i])[0] === findId) {
      return plugins[i]
    }
  }
  return null
}

/**
 * Handles creation of Karma config based on Karma plugins.
 */
export function getKarmaPluginConfig({codeCoverage = false, userConfig = {}} = {}) {
  let browsers = ['PhantomJS']
  let frameworks = ['mocha']
  let plugins = [
    require('karma-sourcemap-loader'),
    require('karma-webpack'),
  ]
  // Default reporter if the user configure their own frameworks
  let reporters = ['dots']

  // Browsers, frameworks and reporters can be configured as a list containing
  // names of bundled plugins, or plugin objects.
  if (userConfig.browsers) {
    let [browserNames, browserPlugins] = processPluginConfig(userConfig.browsers)
    browsers = browserNames
    plugins = plugins.concat(browserPlugins)
  }

  if (userConfig.frameworks) {
    let [frameworkNames, frameworkPlugins] = processPluginConfig(userConfig.frameworks)
    frameworks = frameworkNames
    plugins = plugins.concat(frameworkPlugins)
  }
  else {
    // Use the Mocha reporter by default if the user didn't configure frameworks
    reporters = ['mocha']
  }

  if (userConfig.reporters) {
    let [reporterNames, reporterPlugins] = processPluginConfig(userConfig.reporters)
    reporters = reporterNames
    plugins = plugins.concat(reporterPlugins)
  }

  // Plugins can be provided as a list of imported plugin objects
  if (userConfig.plugins) {
    plugins = plugins.concat(userConfig.plugins)
  }

  // Ensure nwb's version of plugins get loaded if they're going to be used and =
  // haven't been provided by the user.
  if (frameworks.indexOf('mocha') !== -1 && !findPlugin(plugins, 'framework:mocha')) {
    plugins.push(require('karma-mocha'))
  }
  if (reporters.indexOf('mocha') !== -1 && !findPlugin(plugins, 'reporter:mocha')) {
    plugins.push(require('karma-mocha-reporter'))
  }
  if (browsers.indexOf('PhantomJS') !== -1 && !findPlugin(plugins, 'launcher:PhantomJS')) {
    plugins.push(require('karma-phantomjs-launcher'))
  }
  if (browsers.some(function matchChrom(b) { return /Chrom/.test(b) }) &&
      !findPlugin(plugins, 'launcher:Chrome')) {
    plugins.push(require('karma-chrome-launcher'))
  }

  if (codeCoverage) {
    plugins.push(require('karma-coverage'))
    reporters.push('coverage')
  }

  return {browsers, frameworks, plugins, reporters}
}

export default function createKarmaConfig(args, buildConfig, pluginConfig, userConfig) {
  let isCi = process.env.CI || process.env.CONTINUOUS_INTEGRATION
  let codeCoverage = isCi || !!args.coverage

  let userKarma = userConfig.karma || {}

  let {browsers, frameworks, plugins, reporters} = getKarmaPluginConfig({
    codeCoverage,
    userConfig: userKarma,
  })

  let {excludeFromCoverage = DEFAULT_EXCLUDE_FROM_COVERAGE} = userKarma
  let testFiles = userKarma.testFiles || DEFAULT_TEST_FILES

  // Polyfill by default for browsers which lack features (hello PhantomJS)
  let files = [require.resolve('@babel/polyfill/dist/polyfill.js')]
  let preprocessors = {}

  if (userKarma.testContext) {
    files.push(userKarma.testContext)
    preprocessors[userKarma.testContext] = ['webpack', 'sourcemap']
  }
  else {
    testFiles.forEach(testGlob => {
      files.push(testGlob)
      preprocessors[testGlob] = ['webpack', 'sourcemap']
    })
  }

  // Tweak Babel config for code coverage when necessary
  buildConfig = {...buildConfig}
  if (!buildConfig.babel) {
    buildConfig.babel = {}
  }
  if (codeCoverage) {
    let exclude = ['node_modules/', ...excludeFromCoverage, ...testFiles]
    if (userKarma.testContext) {
      exclude.push(userKarma.testContext)
    }
    buildConfig.babel.plugins = [
      [require.resolve('babel-plugin-istanbul'), {exclude}]
    ]
  }

  let karmaConfig = {
    browsers,
    coverageReporter: {
      dir: path.resolve('coverage'),
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: '.'},
        {type: 'text-summary'},
      ],
    },
    files,
    frameworks,
    mochaReporter: {
      showDiff: true,
    },
    plugins,
    preprocessors,
    reporters,
    singleRun: isCi || !args.server,
    webpack: createWebpackConfig(merge(buildConfig, {
      devtool: 'cheap-module-inline-source-map',
      node: {
        fs: 'empty',
      },
      plugins: {
        status: {
          quiet: true,
        }
      },
      resolve: {
        alias: {
          expect: path.dirname(require.resolve('expect/package')),
          src: path.resolve('src'),
        },
      },
      server: {
        hot: false,
      },
    }), pluginConfig, userConfig),
    webpackMiddleware: {
      logLevel: 'silent'
    },
  }

  // Any extra user Karma config is merged into the generated config to give
  // them even more control.
  if (userKarma.extra) {
    karmaConfig = merge(karmaConfig, userKarma.extra)
  }

  // Finally, give the user a chance to do whatever they want with the generated
  // config.
  if (typeOf(userKarma.config) === 'function') {
    karmaConfig = userKarma.config(karmaConfig)
    if (!karmaConfig) {
      throw new UserError(`karma.config() in ${userConfig.path} didn't return anything - it must return the Karma config object.`)
    }
  }

  debug('karma config: %s', deepToString(karmaConfig))
  return karmaConfig
}
