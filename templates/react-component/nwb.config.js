module.exports = {
  // Let nwb know this is a React component module when generic build commands
  // are used.
  type: 'react-component',

  // Should nwb create a UMD build for this module?
  umd: {{umd}},
  // The name of the global variable the UMD build of this module will export
  global: '{{globalVariable}}',
  // Mapping from the npm package names of this module's peerDependencies to the
  // global variables they're expected to be available as for use by the UMD
  // build.
  externals: {
    'react': 'React'
  }
}
