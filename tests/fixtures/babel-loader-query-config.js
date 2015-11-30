// Use case: you want different Babel config for your component and demo builds,
// e.g. your demo uses async/await but your component doesn't
module.exports = {
  type: 'react-component',
  babel: {
    stage: 2
  },
  loaders: {
    babel: {
      exclude: 'test',
      query: {
        loose: 'all',
        stage: 0,
        optioonal: ['runtime']
      }
    }
  }
}
