import runSeries from 'run-series'

import {getBuildCommandConfig} from '../appConfig'
import webpackBuild from '../webpackBuild'
import cleanApp from './clean-app'

/**
 * Build a plain JS app.
 */
export default function buildWebApp(args, cb) {
  let dist = args._[2] || 'dist'

  runSeries([
    (cb) => cleanApp({_: ['clean-app', dist]}, cb),
    (cb) => webpackBuild(`app`, args, () => getBuildCommandConfig(args), cb),
  ], cb)
}
