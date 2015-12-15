module.exports = {
  cssPreprocessors: {
    sass: {
      test: /\.scss$/,
      loader: require.resolve('sass-loader'),
      defaultConfig: 'sassLoader'
    }
  }
}
