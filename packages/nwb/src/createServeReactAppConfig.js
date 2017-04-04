import path from 'path'

import merge from 'webpack-merge'

import {getDefaultHTMLConfig} from './appConfig'
import {directoryExists} from './utils'

export default function createServeReactAppConfig(args, overrides) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config = {
    babel: {
      presets: ['react'],
    },
    entry: [path.resolve(entry)],
    output: {
      path: path.resolve(dist),
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

  if (args.hmr !== false && args.hmre !== false) {
    config.babel.presets.push('react-hmre')
  }

  return merge(config, overrides)
}
