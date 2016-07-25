import umdBuild from '../umdBuild'

/**
 * Create a module's UMD builds.
 */
export default function buildUMD(args, cb) {
  umdBuild(args, {
    presets: ['react'] // XXX
  }, cb)
}
