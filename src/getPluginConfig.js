import path from 'path'

import resolve from 'resolve'
import merge from 'webpack-merge'

import debug from './debug'

/**
 * Look for nwb-* plugin dependencies in package.json, import them and merge the
 * plugin config objects they export.
 */
export default function getPluginConfig(cwd = process.cwd()) {
  let pkg = require(path.join(cwd, 'package.json'))
  let plugins = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ].filter(dep => /^nwb-/.test(dep))

  debug('%s nwb-* dependencies in package.json', plugins.length)
  if (plugins.length) {
    debug('nwb-* dependencies %o', plugins)
  }

  let pluginConfig = {}
  plugins.forEach(plugin => {
    let pluginModule = require(resolve.sync(plugin, {basedir: cwd}))
    pluginConfig = merge(pluginConfig, pluginModule)
  })

  return pluginConfig
}
