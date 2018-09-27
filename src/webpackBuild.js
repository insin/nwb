import ora from 'ora'
import webpack from 'webpack'

import {getPluginConfig, getUserConfig} from './config'
import createWebpackConfig from './createWebpackConfig'
import debug from './debug'
import {deepToString} from './utils'
import {logBuildResults} from './webpackUtils'

/**
 * If you pass a non-falsy type, this will handle spinner display and output
 * logging itself, otherwise use the stats provided in the callback.
 */
export default function webpackBuild(type, args, buildConfig, cb) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }

  let pluginConfig = getPluginConfig(args)
  let userConfig
  try {
    userConfig = getUserConfig(args, {pluginConfig})
  }
  catch (e) {
    return cb(e)
  }

  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig(args)
  }

  let webpackConfig
  try {
    webpackConfig = createWebpackConfig(buildConfig, pluginConfig, userConfig)
  }
  catch (e) {
    return cb(e)
  }

  debug('webpack config: %s', deepToString(webpackConfig))

  let spinner
  if (type) {
    spinner = ora(`Building ${type}`).start()
  }
  let compiler = webpack(webpackConfig)
  compiler.run((err, stats) => {
    if (err) {
      if (spinner) {
        spinner.fail()
      }
      return cb(err)
    }
    if (spinner || stats.hasErrors()) {
      logBuildResults(stats, spinner)
    }
    if (stats.hasErrors()) {
      return cb(new Error('Build failed with errors.'))
    }
    cb(null, stats)
  })
}
