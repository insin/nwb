import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import {getBuildCommandConfig} from '../quickConfig'
import webpackBuild from '../webpackBuild'
import {install} from '../utils'
import cleanApp from './clean-app'

function getCommandConfig(args) {
  let basedir = process.cwd()

  let extra = {
    babel: {
      presets: ['react'],
    },
  }

  if (process.env.NODE_ENV === 'production') {
    extra.babel.presets.push('react-prod')
  }

  if (args.inferno || args['inferno-compat']) {
    let infernoCompat = path.dirname(resolve.sync('inferno-compat/package.json', {basedir}))
    extra.resolve = {
      alias: {
        'react': infernoCompat,
        'react-dom': infernoCompat,
      }
    }
  }
  else if (args.preact || args['preact-compat']) {
    let preactCompat = path.dirname(resolve.sync('preact-compat/package.json', {basedir}))
    extra.resolve = {
      alias: {
        'react': preactCompat,
        'react-dom': preactCompat,
        'create-react-class': 'preact-compat/lib/create-react-class'
      }
    }
  }

  return getBuildCommandConfig(args, {
    defaultTitle: 'React App',
    renderShim: require.resolve('../render-shims/react'),
    renderShimAliases: {
      'react': path.dirname(resolve.sync('react/package.json', {basedir})),
      'react-dom': path.dirname(resolve.sync('react-dom/package.json', {basedir})),
    },
    extra,
  })
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
  else if (args['preact-alias'] || args['preact-aliases']) {
    library = 'Preact (React aliases)'
    packages.push('preact')
  }

  runSeries([
    (cb) => install(packages, {args, check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`${library} app`, args, getCommandConfig, cb),
  ], cb)
}
