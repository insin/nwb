import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackBuild from '../webpackBuild'
import {install} from '../utils'
import cleanApp from './clean-app'

// Using a config function as webpackBuild() sets NODE_ENV to production if it
// hasn't been set by the user and we don't want production optimisations in
// development builds.
function buildConfig(args) {
  let entry = args._[1]
  let dist = args._[2] || 'dist'
  let mountId = args['mount-id'] || 'app'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      commonJSInterop: true,
      presets: ['preact'],
      stage: 0,
    },
    devtool: 'source-map',
    entry: {
      // Use a dummy entry module to support rendering an exported Preact
      // Component or Element for quick prototyping.
      app: [require.resolve('../preactRunEntry')],
    },
    output: {
      chunkFilename: filenamePattern,
      filename: filenamePattern,
      path: path.resolve(dist),
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
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
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
export default function buildPreact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => install(['preact'], {check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`Preact app`, args, buildConfig, cb),
  ], cb)
}
