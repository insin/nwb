import runSeries from 'run-series'

import {getBuildCommandConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

function getCommandConfig(args) {
  return getBuildCommandConfig(args, {
    babel: {
      presets: ['preact'],
    },
    resolve: {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    },
  })
}

/**
 * Build a Preact app.
 */
export default function buildPreactApp(args, cb) {
  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild('Preact app', args, getCommandConfig, cb),
  ], cb)
}
