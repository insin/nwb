/**
 * This module makes base build config for serving a react app accessible to
 * middleware.
 */

import path from 'path'

import {getDefaultHTMLConfig} from './appConfig'

export default function createServeReactAppConfig(args) {
  let entry = path.resolve(args._[1] || 'src/index.js')
  let dist = path.resolve(args._[2] || 'dist')

  return {
    entry: path.resolve(entry),
    output: {
      path: path.resolve(dist),
      filename: 'app.js',
      publicPath: '/',
    },
    plugins: {
      copy: [{from: path.resolve('public'), to: dist}],
      html: getDefaultHTMLConfig(),
    },
  }
}
