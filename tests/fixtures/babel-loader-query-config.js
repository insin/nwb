// Use case: you want different Babel config for your component and demo builds,
// e.g. your demo uses async/await but your component doesn't
module.exports = {
  type: 'react-component',
  babel: {
    stage: 1
  },
  loaders: {
    babel: {
      ignore: 'test',
      query: {
        presets: ['es2015-loose'],
        plugins: ['transform-runtime']
      }
    }
  }
}
