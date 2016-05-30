// Use case: you want different Babel config for your component and demo builds,
// e.g. your demo uses async/await but your component doesn't
module.exports = {
  type: 'react-component',
  babel: {
    stage: 2
  },
  webpack: {
    loaders: {
      babel: {
        exclude: 'test',
        loose: 'all',
        stage: 0,
        optional: ['runtime']
      }
    }
  }
}
