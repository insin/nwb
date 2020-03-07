module.exports = function() {
  return {
    plugins: [
      require.resolve('babel-plugin-syntax-jsx'),
      require.resolve('babel-plugin-inferno'),
    ]
  }
}
