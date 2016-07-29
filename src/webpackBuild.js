import webpack from 'webpack'

import createWebpackConfig from './createWebpackConfig'
import debug from './debug'
import getPluginConfig from './getPluginConfig'
import getUserConfig from './getUserConfig'
import {deepToString, defaultNodeEnv} from './utils'

export default function webpackBuild(args, buildConfig = {}, cb) {
  defaultNodeEnv('production')

  let userConfig = getUserConfig(args)
  let pluginConfig = getPluginConfig()
  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig(args)
  }

  let webpackConfig = createWebpackConfig(buildConfig, pluginConfig, userConfig)

  debug('webpack config: %s', deepToString(webpackConfig))

  let compiler = webpack(webpackConfig)
  compiler.run(cb)
}
