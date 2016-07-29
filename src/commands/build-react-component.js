import glob from 'glob'

import moduleBuild from '../moduleBuild'
import buildDemo from './build-demo'

/**
 * Create a React component's ES5 and ES6 modules and UMD builds and build its
 * demo app if it has one.
 */
export default function buildModule(args, cb) {
  moduleBuild(args, {babel: {presets: ['react']}}, (err) => {
    if (err) return cb(err)
    if (glob.sync('demo/').length === 0) return cb(null)
    buildDemo(args, cb)
  })
}
