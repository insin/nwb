module.exports = {
  cssPreprocessors: {
    less: {
      test: /\.less$/,
      loader: require.resolve('less-loader'),
      defaultConfig: 'lessLoader'
    }
  }
}
