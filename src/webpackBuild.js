import fs from 'fs'
import path from 'path'

import argvSetEnv from 'argv-set-env'
import {cyan, dim, green} from 'chalk'
import filesize from 'filesize'
import {sync as gzipSize} from 'gzip-size'
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
    server: false,
  }, pluginConfig, userConfig)

  debug('webpack config: %s', deepToString(webpackConfig))

  let compiler = webpack(webpackConfig)
  compiler.run((err, stats) => {
    if (err) return cb(err)

    console.log(green('Compiled successfully.'))
    console.log()
    console.log('File sizes after gzip:')
    console.log()

    let outputPath = stats.compilation.outputOptions.path
    let outputDir = path.basename(outputPath)

    let names = Object.keys(stats.compilation.assets).filter(name => /\.(css|js)$/.test(name))
    let longest = names.reduce((max, {length}) => (length > max ? length : max), 0)
    let pad = (name) => Array(longest - name.length + 1).join(' ')

    names
      .map(name => ({
        name,
        size: gzipSize(fs.readFileSync(path.join(outputPath, name)))
      }))
      .sort((a, b) => b.size - a.size)
      .forEach(({name, size}) => {
        console.log(
          `  ${dim(`${outputDir}/`)}${cyan(name)}` +
          `  ${pad(name)}${green(filesize(size))}`
        )
      })

    cb()
  })
}
