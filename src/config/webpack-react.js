// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

import path from 'path'

import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import {createServeLoaders} from '../loaders'

export default function({cwd, entryPath, port, reactPath}, userConfig = {}) {
  let title = 'serve-react'
  try {
    let pkg = require(path.join(cwd, 'package.json'))
    title = `${pkg.name}@${pkg.version}`
  }
  catch (e) {
    // pass
  }

  return {
    devtool: 'eval-source-map',
    entry: [
      `${require.resolve('webpack-dev-server/client')}?http://localhost:${port}`,
      require.resolve('webpack/hot/only-dev-server'),
      entryPath
    ],
    output: {
      filename: 'app.js',
      path: __dirname,
      publicPath: '/'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        ...userConfig.define
      }),
      new HtmlWebpackPlugin({
        template: require.resolve('html-webpack-template/index.html'),
        appMountId: 'app',
        mobile: true,
        title
      })
    ],
    resolve: {
      extensions: ['', '.js', '.jsx', '.json']
    },
    resolveLoader: {
      root: path.join(__dirname, '../../node_modules')
    },
    module: {
      loaders: createServeLoaders({
        babel: {
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
      }, userConfig)
    }
  }
}
