var path = require('path')

module.exports = {
  type: 'react-app',
  babel: {
    cherryPick: 'react-router'
  },
  webpack: {
    aliases: {
      'src': path.resolve('src')
    }
  }
}
