module.exports = {
  // Let nwb know this is a web module when generic build commands are used
  type: 'web-module',

  // The name of the global variable the UMD build of this web module will
  // export.
  global: '{{globalVariable}}',

  // A mapping from the npm package names of this web module's peerDependencies
  // - if it has any - to the global variables they're expected to be available
  // as for use by the UMD build.
  // e.g. {'react': 'React'}
  externals: {}
}
