module.exports = {
  plugins: [
    [require('babel-plugin-react-transform').default, {
      factoryMethods: ['React.createClass', 'createClass', 'createReactClass'],
      transforms: [
        {
          transform: require.resolve('react-transform-hmr'),
          imports: ['react'],
          locals: ['module']
        },
        {
          transform: require.resolve('react-transform-catch-errors'),
          imports: ['react', require.resolve('redbox-noreact')]
        }
      ]
    }]
  ]
}
