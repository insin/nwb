import path from 'path'

import resolve from 'resolve'
import merge from 'webpack-merge'

import debug from './debug'
import {deepToString} from './utils'

/**
 * Look for nwb-* plugin dependencies in package.json, import them and merge the
 * plugin config objects they export.
 */
export default function getPluginConfig(cwd = process.cwd()) {
  let pkg
  try {
    pkg = require(path.join(cwd, 'package.json'))
  }
  catch (e) {
    return {}
  }

  let plugins = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ].filter(dep => /^nwb-/.test(dep))

  debug('%s nwb-* dependencies in package.json', plugins.length)
  if (!plugins.length) {
    return {}
  }

  debug('nwb-* dependencies: %o', plugins)

  let pluginConfig = {}
  plugins.forEach(plugin => {
    let pluginModule = require(resolve.sync(plugin, {basedir: cwd}))
    pluginConfig = merge(pluginConfig, pluginModule)
  })

  debug('plugin config: %s', deepToString(pluginConfig))

  return pluginConfig
}
