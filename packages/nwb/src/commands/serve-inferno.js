import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackServer from '../webpackServer'
import {install} from '../utils'

// Using a config function as we may need to resolve the path to Inferno, which
// we may also have to install first.
function buildConfig(args) {
  let entry = path.resolve(args._[1])
  let mountId = args['mount-id'] || 'app'

  let config = {
    babel: {
      presets: ['inferno'],
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
        title: args.title || 'Inferno App',
      },
    },
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    },
  }

  if (args.force === true) {
    config.entry = [entry]
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = [require.resolve('../infernoRunEntry')]
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
export default function serveInferno(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  runSeries([
    (cb) => install(['inferno', 'inferno-component', 'inferno-compat'], {args, check: true}, cb),
    (cb) => webpackServer(args, buildConfig, cb),
  ], cb)
}
