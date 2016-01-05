import {execSync} from 'child_process'

import debug from './debug'

/**
 * Synchronously call a .bin script with the given args using the given execSync
 * options.
 */
export default function exec(bin, args, options = {}) {
  let command = `${require.resolve(`.bin/${bin}`)} ${args.join(' ')}`
  debug('executing command: %s', command)
  execSync(command, {...options, stdio: [0, 1, 2]})
}
