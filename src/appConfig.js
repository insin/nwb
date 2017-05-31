
import fs from 'fs'
import path from 'path'

import merge from 'webpack-merge'

import {directoryExists} from './utils'

const DEFAULT_HTML_PATH = 'src/index.html'

/**
 * Create default command config for building an app and merge any extra config
 * provided into it.
 */
export function getBuildCommandConfig(args, extra = {}) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    devtool: 'source-map',
    entry: {
      app: [entry],
    },
    output: {
      filename: filenamePattern,
      chunkFilename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: args.html !== false && getDefaultHTMLConfig(),
      vendor: args.vendor !== false,
    },
  }

  if (directoryExists('public')) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  return merge(config, extra)
}

/**
 * Create default command config for serving an app and merge any extra config
 * objects provided into it.
 */
export function createServeCommandConfig(args, ...extra) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config = {
    entry: [entry],
    output: {
      path: dist,
      filename: 'app.js',
      publicPath: '/',
    },
    plugins: {
      html: getDefaultHTMLConfig(),
    },
  }

  if (directoryExists('public')) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  return merge(config, ...extra)
}

export function getDefaultHTMLConfig(cwd = process.cwd()) {
  // Use the default HTML template path if it exists
  if (fs.existsSync(path.join(cwd, DEFAULT_HTML_PATH))) {
    return {
      template: DEFAULT_HTML_PATH,
    }
  }
  // Otherwise provide default variables for the internal template, in case we
  // fall back to it.
  return {
    mountId: 'app',
    title: require(path.join(cwd, 'package.json')).name,
  }
}
