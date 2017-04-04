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
  let entry = path.resolve(args._[1])
  let dist = path.resolve(args._[2] || 'dist')
  let mountId = args['mount-id'] || 'app'

  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      presets: ['preact'],
      stage: 0,
    },
    devtool: 'source-map',
    output: {
      chunkFilename: filenamePattern,
      filename: filenamePattern,
      path: dist,
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || 'Preact App',
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
    resolve: {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    },
  }

  if (args.force === true) {
    config.entry = {app: [entry]}
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = {app: [require.resolve('../preactRunEntry')]}
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
export default function buildPreact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => install(['preact', 'preact-compat'], {args, check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`Preact app`, args, buildConfig, cb),
  ], cb)
}
