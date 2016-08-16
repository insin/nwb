module.exports = {
  cssPreprocessors: {
    sass: {
      test: /\.s[ac]ss$/,
      loader: require.resolve('sass-loader'),
      defaultConfig: 'sassLoader'
    }
  }
}
