import path from 'path'

import glob from 'glob'
import merge from 'webpack-merge'

import {getDefaultHTMLConfig} from './appConfig'

export default function createServePreactAppConfig(args, overrides) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  let config = {
    babel: {
      presets: ['preact'],
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
    resolve: {
      alias: {
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
      }
    },
  }

  if (glob.sync('public/').length !== 0) {
    config.plugins.copy = [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}]
  }

  return merge(config, overrides)
}
