module.exports = {
  type: 'react-component',
  babel: {
    loose: 'all'
  },
  webpack: {
    loaders: {
      babel: {
        exclude: 'test'
      }
    }
  }
}
