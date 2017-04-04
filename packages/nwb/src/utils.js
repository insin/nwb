import util from 'util'

import spawn from 'cross-spawn'
import fs from 'fs-extra'
import ora from 'ora'
import resolve from 'resolve'
import runSeries from 'run-series'

import debug from './debug'

/**
 * Check if the given directories exist and filter out any which don't.
 * @param {Array<string>} dirs directory paths.
 * @param {function(?Error=, Array<string>=)} cb
 */
function checkDirectories(dirs, cb) {
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
 * @param {string} desc a description of what's being cleaned, e.g. 'app'
 * @param {Array<string>} dirs paths to delete.
 * @param {function(?Error=)} cb
 */
export function clean(desc, dirs, cb) {
  checkDirectories(dirs, (err, dirs) => {
    if (err) return cb(err)
    if (dirs.length === 0) return cb()
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
  // XXX Hack for testing
  // TODO Give users a way to disable console clearing
  if (process.env.NWB_TEST) return
  // This will completely wipe scrollback in cmd.exe on Windows - use cmd.exe's
  // `start` command to launch nwb's dev server in a new prompt if you don't
  // want to lose it.
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H')
}

/**
 * Log objects in their entirety so we can see everything in debug output.
 */
export function deepToString(object) {
  return util.inspect(object, {colors: true, depth: null})
}

/**
 * Check if a directory exists.
 * @param {string} dir a directory path.
 * @return {boolean}
 */
export function directoryExists(dir) {
  try {
    return fs.statSync(dir).isDirectory()
  }
  catch (e) {
    return false
  }
}

/**
 * Get a list of nwb plugin names passed as arguments.
 * @param {Object} args parsed arguments.
 * @param {string=} args.plugins comma-separated list of nwb plugin names.
 * @param {string=} args.plugin typo'd comma-separated list of nwb plugin names.
 * @return {Array<string>}
 */
export function getArgsPlugins(args) {
  let plugins = args.plugins || args.plugin
  if (!plugins) return []
  return plugins.split(',').map(name => name.replace(/^(nwb-)?/, 'nwb-'))
}

/**
 * Install packages from npm.
 * @param {Array<string>} packages npm package names, which may be in
 *   package@version format.
 * @param {Object=} options
   @param {Object=} options.args parsed arguments.
 * @param {boolean=} options.check check if packages are resolvable from
 *   the cwd and skip installation if already installed.
 * @param {string=} options.cwd working directory to install in.
 * @param {boolean=} options.dev save dependencies to devDependencies.
 * @param {boolean=} options.save save dependencies to package.json.
 * @param {function(?Error)} cb completion callback.
 */
export function install(packages, options, cb) {
  if (typeOf(options) === 'function') {
    cb = options
    options = {}
  }
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

  let npmArgs = ['install', '--silent', '--no-progress']

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
 * @param {Array<*>} arr
 */
export function joinAnd(array) {
  if (array.length === 0) return ''
  if (array.length === 1) return String(array[0])
  return `${array.slice(0, -1).join(', ')} and ${array[array.length - 1]}`
}

/**
 * Hack to generate simple config file contents by stringifying to JSON, but
 * without JSON formatting.
 */
export function toSource(obj) {
  return JSON.stringify(obj, null, 2)
             .replace(/"([^"]+)":/g, '$1:')
             .replace(/"/g, "'")
}

/**
 * Better typeof.
 */
export function typeOf(o) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

/**
 * @param {Array<string>} strings
 */
export function unique(strings) {
  // eslint-disable-next-line
  return Object.keys(strings.reduce((o, s) => (o[s] = true, o), {}))
}
