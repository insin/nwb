import moduleBuild from '../moduleBuild'

/**
 * Create a web module's ES5, ES6 modules and UMD builds.
 */
export default function buildModule(args, cb) {
  moduleBuild(args, {}, cb)
}
