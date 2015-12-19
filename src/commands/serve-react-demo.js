import path from 'path'

import serveReact from '../serveReact'

/**
 * Serve a web module React demo app from demo/src/index.js.
 */
export default function(args, cb) {
  let pkg = require(path.resolve('package.json'))
  console.log('nwb: serve-react-demo')
  serveReact(args, {
    entry: path.resolve('demo/src/index.js'),
    output: {
      filename: 'demo.js',
      // This doesn't really matter, as files will be served from memory
      path: __dirname,
      publicPath: '/'
    },
    plugins: {
      html: {
        mountId: 'demo',
        title: `${pkg.name} ${pkg.version} Demo`
      }
    }
  }, cb)
}
