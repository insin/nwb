import {execSync} from 'child_process'
import path from 'path'

import glob from 'glob'

/**
 * Get the absolute path to a named .bin script in a manner compatible with
 * global installs and both npm@2 and npm@3 local installs.
 */
function getBinScript(name) {
  // Global install or npm@2 local install, dependencies in local node_modules
  let paths = glob.sync(`../node_modules/.bin/${name}`, {cwd: __dirname})
  if (paths.length > 0) return path.join(__dirname, paths[0])
  // Local npm@3 install, .bin and dependencies are siblings
  paths = glob.sync(`../../.bin/${name}`, {cwd: __dirname})
  if (paths.length > 0) return path.join(__dirname, paths[0])
  throw new Error(`Unable to find .bin script for ${name}`)
}

/**
 * Synchronously call a .bin script with the given args using the given execSync
 * options.
 */
export default function exec(bin, args, options = {}) {
  let command = `${getBinScript(bin)} ${args.join(' ')}`
  console.log(`nwb: ${bin} ${args.join(' ')}`)
  console.log('')
  execSync(command, {...options, stdio: [0, 1, 2]})
}
