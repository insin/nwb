/**
 * This module makes base build config for serving a React app accessible to
 * middleware.
 */

import path from 'path'

import merge from 'webpack-merge'

import {getDefaultHTMLConfig} from './appConfig'

export default function createServeReactAppConfig(args, overrides) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  return merge({
    entry: path.resolve(entry),
    output: {
      path: path.resolve(dist),
      filename: 'app.js',
      publicPath: '/',
    },
    plugins: {
      copy: [{from: path.resolve('public'), to: dist, ignore: '.gitkeep'}],
      html: getDefaultHTMLConfig(),
    },
  }, overrides)
}
