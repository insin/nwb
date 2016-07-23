module.exports = {
  presets: [
    require('babel-preset-stage-1')
  ],
  plugins: [
    require('babel-plugin-transform-decorators-legacy').default
  ]
}
