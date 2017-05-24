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
    resolve: {},
  }

  if (process.env.NODE_ENV === 'production') {
    extra.babel.presets.push('react-prod')
  }

  if (args.inferno || args['inferno-compat']) {
    extra.resolve.alias['react'] = extra.resolve.alias['react-dom'] =
      path.dirname(resolve.sync('inferno-compat/package.json', {basedir}))
  }
  else if (args.preact || args['preact-compat']) {
    extra.resolve.alias['react'] = extra.resolve.alias['react-dom'] =
      path.join(path.dirname(resolve.sync('preact-compat/package.json', {basedir})), 'dist/preact-compat')
  }
  else if (args['preact-alias'] || args['preact-aliases']) {
    extra.resolve.alias['react'] = extra.resolve.alias['react-dom'] =
      path.dirname(resolve.sync('preact/aliases', {basedir}))
  }

  return getBuildCommandConfig(args, {
    defaultTitle: 'React App',
    renderShim: '../render-shims/react',
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
