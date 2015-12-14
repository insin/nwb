module.exports = {
  cssPreprocessors: {
    stylus: {
      test: /\.styl$/,
      loader: require.resolve('stylus-loader'),
      defaultConfig: 'stylus'
    }
  }
}
