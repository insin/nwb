import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackServer from '../webpackServer'
import {install} from '../utils'

// Using a config function as we may need to resolve the path to Preact, which
// we may also have to install first.
function buildConfig(args) {
  let entry = path.resolve(args._[1])
  let mountId = args['mount-id'] || 'app'

  let config = {
    babel: {
      presets: ['preact'],
      stage: 0,
    },
    output: {
      filename: 'app.js',
      path: process.cwd(),
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || 'Preact App',
      },
    },
    resolve: {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    },
  }

  if (args.force === true) {
    config.entry = [entry]
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = [require.resolve('../preactRunEntry')]
    config.plugins.define = {NWB_PREACT_RUN_MOUNT_ID: JSON.stringify(mountId)}
    // Allow the render shim module to import the provided entry module
    config.resolve.alias['nwb-preact-run-entry'] = entry
    // Allow the render shim module to resolve Preact from the cwd
    config.resolve.alias['preact'] = path.dirname(resolve.sync('preact/package.json', {basedir: process.cwd()}))
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
    (cb) => install(['preact', 'preact-compat'], {args, check: true}, cb),
    (cb) => webpackServer(args, buildConfig, cb),
  ], cb)
}
