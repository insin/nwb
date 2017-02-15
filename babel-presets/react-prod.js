module.exports = {
  plugins: [
    require('babel-plugin-transform-react-constant-elements'),
    require('babel-plugin-transform-react-remove-prop-types').default
  ]
}
