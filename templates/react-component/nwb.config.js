module.exports = {
  type: 'react-component',
  build: {
    externals: {
      'react': 'React'
    },
    global: '{{globalVariable}}',
    jsNext: {{jsNext}},
    umd: {{umd}}
  }
}
