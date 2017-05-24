import runSeries from 'run-series'

import {getBuildCommandConfig} from '../appConfig'
import {install} from '../utils'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

function getCommandConfig(args) {
  let extra = {
    babel: {
      presets: ['react'],
    }
  }

  if (process.env.NODE_ENV === 'production') {
    extra.babel.presets.push('react-prod')
  }

  if (args.inferno || args['inferno-compat']) {
    extra.resolve = {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    }
  }
  else if (args.preact || args['preact-compat']) {
    extra.resolve = {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    }
  }

  return getBuildCommandConfig(args, extra)
}

/**
 * Build a React app.
 */
export default function buildReactApp(args, cb) {
  let dist = args._[2] || 'dist'

  let library = 'React'
  let packages = []
  if (args.inferno || args['inferno-compat']) {
    library = 'Inferno (React compat)'
    packages = ['inferno', 'inferno-compat']
  }
  else if (args.preact || args['preact-compat']) {
    library = 'Preact (React compat)'
    packages = ['preact', 'preact-compat']
  }

  runSeries([
    (cb) => install(packages, {check: true}, cb),
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`${library} app`, args, getCommandConfig, cb),
  ], cb)
}
