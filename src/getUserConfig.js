import path from 'path'

import chalk from 'chalk'
import glob from 'glob'

import {PROJECT_TYPES, REACT_COMPONENT, WEB_MODULE} from './constants'
import debug from './debug'
import {UserError} from './errors'
import merge from 'webpack-merge'

// TODO Remove in 0.7
let warnedJSNext = false

export default function getUserConfig(args = {}) {
  // Try to load default user config, or user a config file path we were given
  let userConfig = {}
  let userConfigPath = args.absConfig || path.join(process.cwd(), args.config || 'nwb.config.js')

  if (glob.sync(userConfigPath).length === 0) {
    throw new UserError(`nwb: couldn't find a config file at ${userConfigPath}`)
  }

  try {
    userConfig = require(userConfigPath)
    debug('imported config module from %s', userConfigPath)
  }
  catch (e) {
    throw new UserError(`nwb: couldn't import the config file at ${userConfigPath}`)
  }

  if (typeof userConfig == 'function') {
    userConfig = userConfig()
  }

  if (PROJECT_TYPES.indexOf(userConfig.type) === -1) {
    throw new UserError(
      `nwb: invalid project type configured in ${userConfigPath}: ${userConfig.type}`,
      `nwb: 'type' config must be one of: ${PROJECT_TYPES.join(', ')}`
    )
  }

  // If the user provided some Babel config, automatically apply it to
  // babel-loader as query config unless there's already some set.
  if (!userConfig.loaders) {
    userConfig.loaders = {}
  }

  let {stage, ...babelConfig} = userConfig.babel || {}
  let {query, ...babelLoaderConfig} = userConfig.loaders.babel || {}

  if (typeof stage === 'undefined') {
    stage = 2
  }
  let defaultConfig = {
    query: {
      presets: [
        require.resolve('babel-preset-es2015'),
        require.resolve('babel-preset-react'),
        require.resolve(`babel-preset-stage-${stage}`)
      ]
    }
  }
  userConfig.loaders.babel = merge(defaultConfig, {query: babelConfig}, babelLoaderConfig, {query})
  userConfig.babel = {stage, ...babelConfig}

  // TODO Remove in 0.7
  if ((userConfig.type === REACT_COMPONENT || userConfig.type === WEB_MODULE) && !('jsNext' in userConfig)) {
    if (!warnedJSNext) {
      console.warn(chalk.magenta([
        'nwb: there was no jsNext setting in your nwb config file - this will default to true in nwb 0.6',
        `nwb: set jsNext: true in ${path.basename(userConfigPath)} if you want to keep using the ES6 modules build`
      ].join('\n')))
      warnedJSNext = true
    }
    userConfig.jsNext = true
  }

  debug('final user config: %o', userConfig)

  return userConfig
}
