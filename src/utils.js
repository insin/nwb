// @flow
import path from 'path'
import util from 'util'

import spawn from 'cross-spawn'
import fs from 'fs-extra'
import ora from 'ora'
import resolve from 'resolve'
import runSeries from 'run-series'
import merge from 'webpack-merge'

import debug from './debug'

import type {ErrBack} from './types'

/**
 * Check if the given directories exist and filter out any which don't.
 */
function checkDirectories(
  dirs: string[],
  cb: (?Error, existingDirs?: string[]) => void,
) {
  runSeries(
    dirs.map(dir => cb => fs.stat(dir, (err, stats) => {
      if (err) return cb(err.code === 'ENOENT' ? null : err)
      cb(null, stats.isDirectory() ? dir : null)
    })),
    (err, dirs) => {
      if (err) return cb(err)
      cb(null, dirs.filter(dir => dir != null))
    }
  )
}

/**
 * If any of the given directories exist, display a spinner and delete them.
 */
export function clean(
  // A description of what's being cleaned, e.g. 'app'
  desc: string,
  // Paths to delete
  dirs: string[],
  cb: ErrBack,
) {
  checkDirectories(dirs, (err, dirs) => {
    if (err != null) return cb(err)
    if (dirs == null || dirs.length === 0) return cb()
    let spinner = ora(`Cleaning ${desc}`).start()
    runSeries(
      dirs.map(dir => cb => fs.remove(dir, cb)),
      (err) => {
        if (err) {
          spinner.fail()
          return cb(err)
        }
        spinner.succeed()
        cb()
      }
    )
  })
}

/**
 * Clear console scrollback.
 */
export function clearConsole() {
  // Hack for testing
  if (process.env.NWB_TEST) return
  // This will completely wipe scrollback in cmd.exe on Windows - use cmd.exe's
  // `start` command to launch nwb's dev server in a new prompt if you don't
  // want to lose it.
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')
}

/**
 * Log objects in their entirety so we can see everything in debug output.
 */
export function deepToString(object: Object): string {
  return util.inspect(object, {colors: true, depth: null})
}

/**
 * Check if a directory exists.
 */
export function directoryExists(dir: string): boolean {
  try {
    return fs.statSync(dir).isDirectory()
  }
  catch (e) {
    return false
  }
}

/**
 * Get a list of nwb plugin names passed as arguments.
 */
export function getArgsPlugins(
  args: {
    // comma-separated list of nwb plugin names
    plugins?: string,
    // Comma-separated list of nwb plugin names (allowing for typos)
    plugin?: string,
  }
): string[] {
  let plugins = args.plugins || args.plugin
  if (!plugins) return []
  return plugins.split(',').map(name => name.replace(/^(nwb-)?/, 'nwb-'))
}

type InstallOptions = {
  // Parsed arguments
  args?: Object,
  // Check if packages are resolvable from the cwd and skip installation if
  // already installed.
  check?: boolean,
  // Working directory to install in
  cwd?: string,
  // Save dependencies to devDependencies
  dev?: boolean,
  // Save dependencies to package.json
  save?: boolean,
};

/**
 * Install packages from npm.
 */
export function install(
  // npm package names, which may be in package@version format
  packages: string[],
  options: InstallOptions,
  cb: ErrBack,
) {
  let {
    args = null,
    check = false,
    cwd = process.cwd(),
    dev = false,
    save = false,
  } = options

  // If the command being run allows users to specify an nwb plugins option by
  // providing the args object here, make sure they're installed.
  if (args) {
    packages = packages.concat(getArgsPlugins(args))
  }

  if (check) {
    packages = packages.filter(pkg => {
      // Assumption: we're not dealing with scoped packages, which start with @
      let name = pkg.split('@')[0]
      try {
        resolve.sync(name, {basedir: cwd})
        return false
      }
      catch (e) {
        return true
      }
    })
  }

  if (packages.length === 0) {
    return process.nextTick(cb)
  }

  let npmArgs = ['install', '--silent', '--no-progress', '--no-package-lock']

  if (save) {
    npmArgs.push(`--save${dev ? '-dev' : ''}`)
  }

  npmArgs = npmArgs.concat(packages)

  debug(`${cwd} $ npm ${npmArgs.join(' ')}`)
  let spinner = ora(`Installing ${joinAnd(packages)}`).start()
  let npm = spawn('npm', npmArgs, {cwd, stdio: ['ignore', 'pipe', 'inherit']})
  npm.on('close', (code) => {
    if (code !== 0) {
      spinner.fail()
      return cb(new Error('npm install failed'))
    }
    spinner.succeed()
    cb()
  })
}

/**
 * Join multiple items with a penultimate "and".
 */
export function joinAnd(array: any[], lastClause: string = 'and') {
  if (array.length === 0) return ''
  if (array.length === 1) return String(array[0])
  return `${array.slice(0, -1).join(', ')} ${lastClause} ${array[array.length - 1]}`
}

/**
 * Get the path to an npm module.
 */
export function modulePath(module: string, basedir: string = process.cwd()): string {
  return path.dirname(resolve.sync(`${module}/package.json`, {basedir}))
}

export function padLines(message: string, padding: string = '  '): string {
  return message.split('\n').map(line => `${padding}${line}`).join('\n')
}

export function pluralise(count: number, suffixes : string = ',s'): string {
  return suffixes.split(',')[count === 1 ? 0 : 1]
}

/**
 * Custom merge which replaces arrays instead of concatenating them.
 */
export const replaceArrayMerge = merge({customizeArray(a, b, key) { return b }})

/**
 * Hack to generate simple config file contents by stringifying to JSON, but
 * without JSON formatting.
 */
export function toSource(obj: Object) {
  return JSON.stringify(obj, null, 2)
             .replace(/"([^"]+)":/g, '$1:')
             .replace(/"/g, "'")
}

/**
 * Better typeof.
 */
export function typeOf(o: any) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

/**
 * @param {Array<string>} strings
 */
export function unique(strings: string[]): string[] {
  // eslint-disable-next-line
  return Object.keys(strings.reduce((o, s) => (o[s] = true, o), {}))
}
