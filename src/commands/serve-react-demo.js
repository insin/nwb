import path from 'path'

import serveReact from '../serveReact'

/**
 * Serve a web module React demo app from demo/src/index.js.
 */
export default function(args) {
  let pkg = require(path.resolve('package.json'))
  console.log('nwb: serve-react-demo')
  serveReact(args, {
    entry: path.resolve('demo/src/index.js'),
    output: {
      filename: 'app.js',
      // This doesn't really matter, as files will be served from memory
      path: __dirname,
      publicPath: '/'
    },
    plugins: {
      html: {
        template: require.resolve('html-webpack-template/index.html'),
        appMountId: 'demo',
        mobile: true,
        title: `${pkg.name} ${pkg.version} Demo`
      }
    }
  })
}
