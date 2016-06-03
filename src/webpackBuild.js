import argvSetEnv from 'argv-set-env'
import webpack from 'webpack'

import createWebpackConfig from './createWebpackConfig'
import debug from './debug'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'
import {deepToString} from './utils'

export default function webpackBuild(args, buildConfig = {}, cb) {
  // Don't override environment if it's already set
  if (!process.env.NODE_ENV) {
    // Set cross-platform environment variables based on any --set-env-NAME
    // arguments passed to the command.
    argvSetEnv()
    // Default environment for a build
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production'
    }
  }

  let userConfig = getUserConfig(args)
  let pluginConfig = getPluginConfig()
  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig(args)
  }

  let webpackConfig = createWebpackConfig({
    ...buildConfig,
    server: false
  }, pluginConfig, userConfig.webpack)

  debug('webpack config: %s', deepToString(webpackConfig))

  let compiler = webpack(webpackConfig)
  compiler.run((err, stats) => {
    if (err) return cb(err)
    console.log(stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false
    }))
    cb()
  })
}
