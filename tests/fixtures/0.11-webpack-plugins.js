module.exports = {
  webpack: {
    plugins: {
      define: {
        __TEST__: 42
      },
      html: {
        template: 'test.html'
      }
    }
  }
}
