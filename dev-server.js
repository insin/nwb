var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')

module.exports = function server(config, options) {
  new WebpackDevServer(webpack(config), {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
    stats: {colors: true}
  }).listen(options.port, 'localhost', function(err) {
    if (err) throw err
    console.log('nwb dev server listening at http://localhost:' + options.port)
  })
}
