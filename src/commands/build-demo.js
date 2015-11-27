import path from 'path'

import webpackBuild from '../webpackBuild'

/**
 * Build a web module's demo app from demo/src/index.js.
 */
export default function(args) {
  let pkg = require(path.resolve('package.json'))

  console.log('nwb: build-demo')
  webpackBuild(args, {
    entry: path.resolve('demo/src/index.js'),
    output: {
      filename: 'demo.js',
      path: path.resolve('demo/dist')
    },
    plugins: {
      html: {
        template: require.resolve('html-webpack-template/index.html'),
        appMountId: 'app',
        mobile: true,
        title: `${pkg.name} ${pkg.version} Demo`
      }
    }
  })
}
