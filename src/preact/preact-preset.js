module.exports = function() {
  return {
    plugins: [
      [require.resolve('@babel/plugin-transform-react-jsx'), {pragma: 'h'}]
    ]
  }
}
