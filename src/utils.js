import {execSync, exec} from 'child_process'
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

export function useYarn() {
  try {
    execSync('yarn --version', {stdio: 'ignore'})
    return true
  }
  catch (e) {
    return false
  }
}

/**
 * Install all app dependencies when creating a new project
 */
export function installAppDependencies({dev = false, save = false, cwd = process.cwd(), version = 'latest', dependencies = []} = {}, cb) {
  const saveArg = save ? ` --save${dev ? '-dev' : ''}` : ''
  let command = `npm install${saveArg} ${dependencies.join(' ')}`

  if (useYarn()) {
    command = `yarn add ${dependencies.join(' ')} ${dev ? '--dev' : ''}`
  }
  const spinner = ora(`Installing dependencies using ${useYarn() ? 'yarn' : 'npm'}`).start()
  debug(`${cwd} $ ${command}`)
  exec(command, {cwd, stdio: 'ignore'}, err => {
    if (err) {
      spinner.fail()
      return cb(err)
    }
    spinner.text = `Installed dependencies using ${useYarn() ? 'yarn' : 'npm'}`
    spinner.succeed()
    cb()
  })
}

/**
 * Better typeof.
 */
export function typeOf(o) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}
