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
    defaultTitle: 'Preact App',
    renderShim: require.resolve('../render-shims/preact'),
    renderShimAliases: {
      'preact': path.dirname(resolve.sync('preact/package.json', {basedir: process.cwd()})),
    },
    extra: {
      babel: {
        presets: ['preact'],
      },
      resolve: {
        alias: {
          'react': 'preact-compat',
          'react-dom': 'preact-compat',
          'create-react-class': 'preact-compat/lib/create-react-class',
        }
      }
    },
  })
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
    (cb) => webpackBuild(`Preact app`, args, getCommandConfig, cb),
  ], cb)
}
