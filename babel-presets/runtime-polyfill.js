module.exports = {
  plugins: [
    [require('babel-plugin-transform-runtime'), {
      polyfill: true,
      regenerator: false
    }]
  ]
}
