module.exports = {
  plugins: [
    [require('babel-plugin-transform-runtime'), {
      polyfill: false,
      regenerator: true
    }]
  ]
}
