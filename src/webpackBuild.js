import assert from 'assert'

import argvSetEnv from 'argv-set-env'
import webpack from 'webpack'

import createWebpackConfig from './createWebpackConfig'
import getUserConfig from './getUserConfig'

export default function(args, buildConfig = {}, cb) {
  // Don't override NODE_ENV if it's already set
  if (!process.env.NODE_ENV) {
    // Set cross-platform environment variables based on --set-env-NAME arguments
    argvSetEnv()
    // Default environment setting for a build
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production'
    }
  }

  let userConfig = getUserConfig(args)
  if (typeof buildConfig == 'function') {
    buildConfig = buildConfig()
  }

  assert(buildConfig.entry, 'entry config is required to create a Webpack build')
  assert(buildConfig.output, 'output config is required to create a Webpack build')

  let {
    devtool, entry, output, loaders, define, plugins, ...otherBuildConfig
  } = buildConfig

  let webpackConfig = createWebpackConfig(process.cwd(), {
    server: false,
    devtool,
    entry,
    output,
    loaders,
    plugins: {
      define: {...define, ...userConfig.define},
      appStyle: 'style',
      ...plugins
    },
    ...otherBuildConfig
  }, userConfig)

  let compiler = webpack(webpackConfig)
  compiler.run((err, stats) => {
    if (err) {
      console.error('nwb: webpack build error:')
      console.error(err.stack)
      process.exit(1)
    }
    console.log(stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false
    }))
    if (cb) {
      cb()
    }
  })
}
