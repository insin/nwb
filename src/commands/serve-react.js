import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import webpackServer from '../webpackServer'
import {install} from '../utils'

// Using a config function as we may need to resolve the path to React and
// ReactDOM, which we may also have to install first.
function buildConfig(args) {
  let entry = path.resolve(args._[1])
  let mountId = args['mount-id'] || 'app'

  let config = {
    babel: {
      presets: ['react', 'react-hmre'],
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
        title: args.title || 'React App',
      },
    },
  }

  if (args.force === true) {
    config.entry = [entry]
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = [require.resolve('../reactRunEntry')]
    config.plugins.define = {NWB_REACT_RUN_MOUNT_ID: JSON.stringify(mountId)}
    config.resolve = {
      alias: {
        // Allow the render shim module to import the provided entry module
        'nwb-react-run-entry': entry,
        // Allow the render shim module to resolve React and ReactDOM from the cwd
        'react': path.dirname(resolve.sync('react/package.json', {basedir: process.cwd()})),
        'react-dom': path.dirname(resolve.sync('react-dom/package.json', {basedir: process.cwd()})),
      }
    }
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  return config
}

/**
 * Serve a standalone React entry module, component or element.
 */
export default function serveReact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be specified.'))
  }

  runSeries([
    (cb) => install(['react', 'react-dom'], {args, check: true}, cb),
    (cb) => webpackServer(args, buildConfig, cb),
  ], cb)
}
