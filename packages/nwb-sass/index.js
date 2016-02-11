module.exports = {
  cssPreprocessors: {
    sass: {
      test: /\.scss$|\.sass$/,
      loader: require.resolve('sass-loader'),
      defaultConfig: 'sassLoader'
    }
  }
}
