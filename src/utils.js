import fs from 'fs-extra'
import glob from 'glob'

const GITKEEP_RE = /\.gitkeep$/

export function copyPublicDir(from, to) {
  fs.ensureDirSync(to)
  if (glob.sync(`${from}/`).length !== 0) {
    fs.copySync(from, to, {
      filter(file) { return !GITKEEP_RE.test(file) }
    })
  }
}

export function createBanner(pkg) {
  let banner = `${pkg.name} ${pkg.version}`
  if (pkg.homepage) {
    banner += ` - ${pkg.homepage}`
  }
  if (pkg.license) {
    banner += `\n${pkg.license} Licensed`
  }
  return banner
}

export function createWebpackExternals(externals = {}) {
  return Object.keys(externals).reduce((webpackExternals, packageName) => {
    let globalName = externals[packageName]
    webpackExternals[packageName] = {
      root: globalName,
      commonjs2: packageName,
      commonjs: packageName,
      amd: packageName
    }
    return webpackExternals
  }, {})
}

/**
 * String.prototype.endsWith() is behind the --harmony flag in Node.js v0.12.
 */
export function endsWith(s1, s2) {
  return s1.lastIndexOf(s2) === s1.length - s2.length
}

/**
 * Better typeof.
 */
export function typeOf(o) {
  if (Number.isNaN(o)) return 'nan'
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}
