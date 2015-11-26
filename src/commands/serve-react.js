import path from 'path'

import resolve from 'resolve'

import devServer from '../devServer'
import getUserConfig from '../getUserConfig'
import createWebpackConfig from '../createWebpackConfig'

export default function(args) {
  let [cmd, entryPath] = args._

  if (!entryPath) {
    console.error(`${cmd}: the path to an entry module must be provided`)
    process.exit(1)
  }

  let cwd = process.cwd()
  let entry = path.resolve(entryPath)
  let port = args.port || 3000
  let reactPath
  try {
    reactPath = resolve.sync('react', {basedir: cwd})
  }
  catch (e) {
    console.error(`${cmd}: React must be installed locally`)
    process.exit(1)
  }
  let userConfig = getUserConfig(args.config)
  let webpackConfig = createWebpackConfig(cwd, {
    server: true,
    devtool: 'eval-source-map',
    entry: [
      // Polyfill EventSource for IE, as webpack-hot-middleware/client uses it
      require.resolve('eventsource-polyfill'),
      require.resolve('webpack-hot-middleware/client'),
      entry
    ],
    output: {
      path: path.resolve('public/build'),
      filename: 'app.js',
      publicPath: '/build/'
    },
    loaders: {
      babel: {
        query: {
          loose: 'all',
          plugins: [
            require.resolve('babel-plugin-react-display-name'),
            require.resolve('babel-plugin-react-transform')
          ],
          extra: {
            'react-transform': {
              transforms: [{
                transform: require.resolve('react-transform-hmr'),
                imports: [reactPath],
                locals: ['module']
              }, {
                transform: require.resolve('react-transform-catch-errors'),
                imports: [reactPath, require.resolve('redbox-noreact')]
              }]
            }
          }
        }
      }
    }
  }, userConfig.webpack)

  devServer(webpackConfig, {
    noInfo: !args.info,
    port,
    staticPath: path.resolve('public')
  })
}
