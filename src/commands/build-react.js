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

  let basedir = process.cwd()
  let production = process.env.NODE_ENV === 'production'
  let filenamePattern = production ? '[name].[chunkhash:8].js' : '[name].js'

  let config = {
    babel: {
      presets: ['react'],
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
        title: args.title || 'React App',
      },
      // A vendor bundle must be explicitly enabled with a --vendor flag
      vendor: args.vendor,
    },
    resolve: {
      alias: {}
    },
  }

  if (args.force === true) {
    config.entry = {app: [path.resolve(entry)]}
  }
  else {
    // Use a render shim module which supports quick prototyping
    config.entry = {app: [require.resolve('../reactRunEntry')]}
    config.plugins.define = {NWB_REACT_RUN_MOUNT_ID: JSON.stringify(mountId)}
    // Allow the render shim module to import the provided entry module
    config.resolve.alias['nwb-react-run-entry'] = path.resolve(entry)
    // Allow the render shim module to resolve React and ReactDOM from the cwd
    config.resolve.alias['react'] = path.dirname(resolve.sync('react/package.json', {basedir}))
    config.resolve.alias['react-dom'] = path.dirname(resolve.sync('react-dom/package.json', {basedir}))
  }

  if (args.polyfill === false || args.polyfills === false) {
    config.polyfill = false
  }

  if (args.inferno || args['inferno-compat']) {
    config.resolve.alias['react'] = config.resolve.alias['react-dom'] =
      path.dirname(resolve.sync('inferno-compat/package.json', {basedir}))
  }
  else if (args.preact || args['preact-compat']) {
    config.resolve.alias['react'] = config.resolve.alias['react-dom'] =
      path.join(path.dirname(resolve.sync('preact-compat/package.json', {basedir})), 'dist/preact-compat')
  }

  if (production) {
    config.babel.presets.push('react-prod')
  }

  return config
}

/**
 * Build a standalone React entry module.
 */
export default function buildReact(args, cb) {
  if (args._.length === 1) {
    return cb(new UserError('An entry module must be given.'))
  }

  let dist = args._[2] || 'dist'

  let library = 'React'
  let packages = ['react', 'react-dom']
  if (args.inferno || args['inferno-compat']) {
    library = 'Inferno (React compat)'
    packages.push('inferno', 'inferno-compat')
  }
  else if (args.preact || args['preact-compat']) {
    library = 'Preact (React compat)'
    packages.push('preact', 'preact-compat')
  }

  runSeries([
    (cb) => install(packages, {args, check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`${library} app`, args, buildConfig, cb),
  ], cb)
}
