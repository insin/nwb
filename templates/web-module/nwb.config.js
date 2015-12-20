module.exports = {
  // Let nwb know this is a web module when generic build commands are used
  type: 'web-module',

  // Should nwb create a UMD build for this module?
  umd: {{umd}},
  // The name of the global variable the UMD build of this module will export
  global: '{{globalVariable}}',
  // A mapping from the npm package names of this module's peerDependencies - if
  // it has any - to the global variables they're expected to be available as
  // for use by the UMD build, e.g. {'react': 'React'}
  externals: {},

  // Should nwb create a build with untranspiled ES6 modules for tree-shaking
  // module bundlers? If you change your mind later, add or remove this line in
  // package.json: "jsnext:main": "es6/index.js"
  jsNext: {{jsNext}}
}
