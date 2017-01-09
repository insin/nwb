import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackServer from '../webpackServer'
import {install} from '../utils'

// Using a config function as we need to resolve the path to Preact, which we
// may have to install first.
function buildConfig(args) {
  let entry = args._[1]
  let mountId = args['mount-id'] || 'app'

  let config = {
    babel: {
      commonJSInterop: true,
      presets: ['preact'],
      stage: 0,
    },
    // Use a dummy entry module to support rendering an exported Preact
    // component or element for quick prototyping.
    entry: [require.resolve('../preactRunEntry')],
    output: {
      filename: 'app.js',
      path: process.cwd(),
      publicPath: '/',
    },
    plugins: {
      define: {
        NWB_PREACT_RUN_MOUNT_ID: JSON.stringify(mountId)
      },
      html: {
        mountId,
        title: args.title || 'Preact App',
      },
    },
    resolve: {
      alias: {
        // Allow the dummy entry module to import the provided entry module
        'nwb-preact-run-entry': path.resolve(entry),
        // Allow the dummy entry module to resolve Preact from the cwd
        'preact': path.dirname(resolve.sync('preact/package.json', {basedir: process.cwd()})),
      }
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return config
}

/**
 * Build a standalone Preact entry module, component or element.
 */
export default function servePreact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  runSeries([
    (cb) => install(['preact'], {check: true}, cb),
    (cb) => webpackServer(args, buildConfig, cb),
  ], cb)
}
