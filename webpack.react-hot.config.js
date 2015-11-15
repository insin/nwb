// Set cross-platform environment variables based on --set-env-NAME arguments
require('argv-set-env')()

// Default environment settings
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

var path = require('path')

var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = function config(options) {
  var pkg = require(path.join(options.cwd, 'package.json'))

  return {
    devtool: 'eval-source-map',
    entry: [
      'webpack-dev-server/client?http://localhost:' + options.port,
      'webpack/hot/only-dev-server',
      options.entry
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
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }),
      new HtmlWebpackPlugin({
        template: require.resolve('html-webpack-template/index.html'),
        appMountId: 'app',
        mobile: true,
        title: pkg.name + ' ' + pkg.version
      })
    ],
    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['node_modules']
    },
    resolveLoader: {
      modulesDirectories: ['node_modules'],
      root: path.join(__dirname, 'node_modules')
    },
    module: {
      loaders: [
        {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/, query: {
          stage: 2,
          loose: 'all',
          plugins: [
            'react-transform'
          ],
          extra: {
            'react-transform': {
              transforms: [{
                transform: 'react-transform-hmr',
                imports: ['react'],
                locals: ['module']
              }, {
                transform: 'react-transform-catch-errors',
                imports: ['react', 'redbox-react']
              }]
            }
          }
        }},
        {test: /\.css$/, loader: 'style!css?-minimize'},
        {test: /\.(gif|jpe?g|png)$/, loader: 'url?limit=10240'},
        {test: /\.(otf|eot|svg|ttf|woff|woff2).*$/, loader: 'url?limit=10240'},
        {test: /\.json$/, loader: 'json'}
      ]
    }
  }
}
