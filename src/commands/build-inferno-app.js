import runSeries from 'run-series'

import {getBuildCommandConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

function getCommandConfig(args) {
  return getBuildCommandConfig(args, {
    babel: {
      presets: ['inferno'],
    },
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    },
  })
}

/**
 * Build an Inferno app.
 */
export default function buildInfernoApp(args, cb) {
  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild('Inferno app', args, getCommandConfig, cb),
  ], cb)
}
