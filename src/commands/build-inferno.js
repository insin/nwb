import path from 'path'

import resolve from 'resolve'
import runSeries from 'run-series'

import {UserError} from '../errors'
import {getBuildCommandConfig} from '../quickConfig'
import webpackBuild from '../webpackBuild'
import {install} from '../utils'
import cleanApp from './clean-app'

function getCommandConfig(args) {
  return getBuildCommandConfig(args, {
    defaultTitle: 'Inferno App',
    renderShim: '../render-shims/inferno',
    renderShimAliases: {
      'inferno': path.dirname(resolve.sync('inferno/package.json', {basedir: process.cwd()})),
    },
    extra: {
      babel: {
        presets: ['inferno'],
      },
      resolve: {
        alias: {
          'react': 'inferno-compat',
          'react-dom': 'inferno-compat',
        }
      }
    },
  })
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
    (cb) => webpackBuild(`Inferno app`, args, getCommandConfig, cb),
  ], cb)
}
