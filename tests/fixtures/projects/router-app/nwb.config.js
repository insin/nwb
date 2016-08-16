var path = require('path')

module.exports = {
  type: 'react-app',
  // TODO Re-enable once babel-plugin-lodash@>3.2.7 lands
  // babel: {
  //   cherryPick: 'react-router'
  // },
  webpack: {
    aliases: {
      'src': path.resolve('src')
    }
  }
}
