import path from 'path'

import webpackServer from '../webpackServer'

/**
 * Serve a React demo app from demo/src/index.js.
 */
export default function serveReactDemo(args, cb) {
  let pkg = require(path.resolve('package.json'))

  let config = {
    babel: {
      presets: ['react'],
    },
    entry: [path.resolve('demo/src/index.js')],
    output: {
      filename: 'demo.js',
      // This doesn't really matter, as files will be served from memory
      path: process.cwd(),
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`,
      },
    },
  }

  if (args.hmr !== false && args.hmre !== false) {
    config.babel.presets.push('react-hmre')
  }

  webpackServer(args, config, cb)
}
