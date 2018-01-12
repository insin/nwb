import moduleBuild from '../moduleBuild'

/**
 * Create a web module's ES5, ES modules and UMD builds.
 */
export default function buildModule(args, cb) {
  moduleBuild(args, {
    babel: {
      runtime: {
        helpers: false
      }
    }
  }, cb)
}
