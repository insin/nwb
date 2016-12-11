import {execSync} from 'child_process'
import util from 'util'

import argvSetEnv from 'argv-set-env'
import ora from 'ora'
import rimraf from 'rimraf'
import runSeries from 'run-series'

import debug from './debug'

export function clean(name, dirs, cb) {
  let spinner = ora(`Cleaning ${name}`).start()
  runSeries(
    dirs.map(dir => cb => rimraf(dir, cb)),
    (err) => {
      if (err) {
        spinner.fail()
        return cb(err)
      }
      spinner.succeed()
      cb()
    }
  )
}

export function clearConsole() {
  if (process.env.NWB_TEST) return
  // This will completely wipe scrollback in cmd.exe on Windows - recommend
  // using the `start` command to launch nwb's dev server in a new prompt.
  process.stdout.write('\x1bc')
}

/**
 * Create a banner comment for a UMD build file from package.json config.
 */
export function createBanner(pkg) {
  let banner = `${pkg.name} v${pkg.version}`
  if (pkg.homepage) {
    banner += ` - ${pkg.homepage}`
  }
  if (pkg.license) {
    banner += `\n${pkg.license} Licensed`
  }
  return banner
}

/**
 * Create Webpack externals config from a module → global variable mapping.
 */
export function createWebpackExternals(externals = {}) {
  return Object.keys(externals).reduce((webpackExternals, packageName) => {
    let globalName = externals[packageName]
    webpackExternals[packageName] = {
      root: globalName,
      commonjs2: packageName,
      commonjs: packageName,
      amd: packageName,
    }
    return webpackExternals
  }, {})
}

/**
 * Log objects in their entirety so we can see everything in debug output.
 */
export function deepToString(object) {
  return util.inspect(object, {colors: true, depth: null})
}

export function defaultNodeEnv(nodeEnv) {
  // Set cross-platform environment variables based on any --set-env-NAME
  // arguments passed to the command.
  argvSetEnv()
  // Don't override environment it's been set
  if (!process.env.NODE_ENV) {
    // Default environment for a build
    process.env.NODE_ENV = nodeEnv
  }
}

/**
 * String.prototype.endsWith() is behind the --harmony flag in Node.js v0.12.
 */
export function endsWith(s1, s2) {
  return s1.lastIndexOf(s2) === s1.length - s2.length
}

/**
 * Install Inferno for the user when it's needed.
 */
export function installInferno({dev = false, save = false, cwd = process.cwd(), version = 'latest'} = {}) {
  let saveArg = save ? ` --save${dev ? '-dev' : ''}` : ''
  let command = `npm install${saveArg} inferno@${version} inferno-component@${version}`
  debug(`${cwd} $ ${command}`)
  execSync(command, {cwd, stdio: 'inherit'})
}

/**
 * Install Preact for the user when it's needed.
 */
export function installPreact({dev = false, save = false, cwd = process.cwd(), version = 'latest'} = {}) {
  let saveArg = save ? ` --save${dev ? '-dev' : ''}` : ''
  let command = `npm install${saveArg} preact@${version}`
  debug(`${cwd} $ ${command}`)
  execSync(command, {cwd, stdio: 'inherit'})
}

/**
 * Install React for the user when it's needed.
 */
export function installReact({dev = false, save = false, cwd = process.cwd(), version = 'latest'} = {}) {
  let saveArg = save ? ` --save${dev ? '-dev' : ''}` : ''
  let command = `npm install${saveArg} react@${version} react-dom@${version}`
  debug(`${cwd} $ ${command}`)
  execSync(command, {cwd, stdio: 'inherit'})
}

/**
 * Better typeof.
 */
export function typeOf(o) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}
