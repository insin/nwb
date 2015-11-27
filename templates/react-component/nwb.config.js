module.exports = {
  // Let nwb know this is a React component module when generic build commands
  // are used.
  type: 'react component',

  // The name of the global variable the UMD build of this React component
  // module will export.
  global: '{{globalVariable}}',

  // A mapping from the npm package names of this React component's
  // peerDependencies to the global variables they're expected to be available
  // as for use by the UMD build.
  externals: {
    'react': 'React'
  }
}
