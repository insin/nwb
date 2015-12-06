import path from 'path'

import glob from 'glob'

/**
 * String.prototype.endsWith() is behind the --harmony flag in Node.js v0.12.
 */
export function endsWith(s1, s2) {
  return s1.lastIndexOf(s2) === s1.length - s2.length
}

/**
 * Find the node_modules directory containing nwb's dependencies.
 */
export function findNodeModules() {
  let nodeModules
  if (glob.sync('../node_modules/', {cwd: __dirname}).length > 0) {
    // Global installs and npm@2 local installs have a local node_modules dir
    nodeModules = path.join(__dirname, '../node_modules')
  }
  else {
    // Otherwise assume an npm@3 local install, with node_modules as the parent
    nodeModules = path.join(__dirname, '../../node_modules')
  }
  return nodeModules
}

/**
 * Better typeof.
 */
export function typeOf(o) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}
