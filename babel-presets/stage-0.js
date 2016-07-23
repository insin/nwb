module.exports = {
  presets: [
    require('./stage-1')
  ],
  plugins: [
    require('babel-plugin-transform-do-expressions'),
    require('babel-plugin-transform-function-bind')
  ]
}
