import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackServer from '../webpackServer'
import {install} from '../utils'

// Using a config function as we need to resolve the path to Inferno, which we
// may have to install first.
function buildConfig(args) {
  let entry = args._[1]
  let mountId = args['mount-id'] || 'app'

  let config = {
    babel: {
      commonJSInterop: true,
      presets: ['inferno'],
      stage: 0,
    },
    // Use a dummy entry module to support rendering an exported Inferno
    // Component or VNode for quick prototyping.
    entry: [require.resolve('../infernoRunEntry')],
    output: {
      filename: 'app.js',
      path: process.cwd(),
      publicPath: '/',
    },
    plugins: {
      define: {
        NWB_INFERNO_RUN_MOUNT_ID: JSON.stringify(mountId)
      },
      html: {
        mountId,
        title: args.title || 'Inferno App',
      },
    },
    resolve: {
      alias: {
        // Allow the dummy entry module to resolve Inferno from the cwd
        'inferno': path.dirname(resolve.sync('inferno/package.json', {basedir: process.cwd()})),
        // Allow the dummy entry module to import the provided entry module
        'nwb-inferno-run-entry': path.resolve(entry),
      }
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return config
}

/**
 * Build a standalone Inferno entry module, component or VNode.
 */
export default function serveInferno(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  runSeries([
    (cb) => install(['inferno', 'inferno-component'], {check: true}, cb),
    (cb) => webpackServer(args, buildConfig, cb),
  ], cb)
}
