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
      presets: ['inferno'],
      stage: 0,
    },
    devtool: 'source-map',
    output: {
      chunkFilename: filenamePattern,
      filename: filenamePattern,
      path: path.resolve(dist),
      publicPath: '/',
    },
    plugins: {
      html: {
        mountId,
        title: args.title || 'Inferno App',
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat'
      }
    }
  }

  if (args.force === true) {
    config.entry = {app: [entry]}
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = {app: [require.resolve('../infernoRunEntry')]}
    config.plugins.define = {NWB_INFERNO_RUN_MOUNT_ID: JSON.stringify(mountId)}
    // Allow the render shim module to resolve Inferno from the cwd
    config.resolve.alias['inferno'] = path.dirname(resolve.sync('inferno/package.json', {basedir: process.cwd()}))
    // Allow the render shim module to import the provided entry module
    config.resolve.alias['nwb-inferno-run-entry'] = entry
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return config
}

/**
 * Build a standalone Inferno entry module, component or VNode.
 */
export default function buildInferno(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => install(['inferno', 'inferno-component', 'inferno-compat'], {args, check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`Inferno app`, args, buildConfig, cb),
  ], cb)
}
