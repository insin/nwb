// @flow
import path from 'path'

import {UserError} from './errors'
import {typeOf} from './utils'

type BabelPluginConfig = string | [string, Object];

type BabelConfig = {
  presets: BabelPluginConfig[],
  plugins?: BabelPluginConfig[],
};

type BuildOptions = {
  commonJSInterop?: boolean,
  env?: Object,
  modules?: false | string,
  plugins?: BabelPluginConfig[],
  presets?: string[],
  removePropTypes?: true | Object,
  setRuntimePath?: false,
  stage?: number,
  webpack?: boolean,
};

type UserOptions = {
  cherryPick?: string | string[],
  config?: (BabelConfig) => BabelConfig,
  env?: Object,
  loose?: boolean,
  plugins?: BabelPluginConfig[],
  presets?: BabelPluginConfig[],
  reactConstantElements?: boolean,
  removePropTypes?: false | Object,
  runtime?: boolean | string,
  stage?: false | number,
};

const DEFAULT_STAGE = 2
const RUNTIME_PATH = path.dirname(require.resolve('babel-runtime/package'))

export default function createBabelConfig(
  buildConfig: BuildOptions = {},
  userConfig: UserOptions = {},
  userConfigPath: string = ''
): BabelConfig {
  let {
    commonJSInterop,
    modules = false,
    plugins: buildPlugins = [],
    presets: buildPresets,
    removePropTypes: buildRemovePropTypes = false,
    setRuntimePath,
    stage: buildStage = DEFAULT_STAGE,
    webpack = true,
  } = buildConfig

  let {
    cherryPick,
    config: userConfigFunction,
    env = {},
    loose,
    plugins: userPlugins = [],
    presets: userPresets,
    reactConstantElements,
    removePropTypes: userRemovePropTypes,
    runtime: userRuntime,
    stage: userStage,
  } = userConfig

  let presets: BabelPluginConfig[] = []
  let plugins: BabelPluginConfig[] = []

  // Default to loose mode unless explicitly configured
  if (typeOf(loose) === 'undefined') {
    loose = true
  }

  presets.push(
    [require.resolve('babel-preset-env'), {loose, modules, ...env}]
  )

  // Additional build presets
  if (Array.isArray(buildPresets)) {
    buildPresets.forEach(preset => {
      // Presets which are configurable via user config are specified by name so
      // customisation can be handled in this module.
      if (preset === 'react-prod') {
        // Hoist static element subtrees up so React can skip them when reconciling
        if (reactConstantElements !== false) {
          plugins.push(require.resolve('babel-plugin-transform-react-constant-elements'))
        }
        // Remove or wrap propTypes and optionally remove prop-types imports
        if (userRemovePropTypes !== false) {
          plugins.push([
            require.resolve('babel-plugin-transform-react-remove-prop-types'),
            typeof userRemovePropTypes === 'object' ? userRemovePropTypes : {}
          ])
        }
      }
      // All other presets are assumed to be paths to a preset module
      else {
        presets.push(preset)
      }
    })
  }

  // Stage preset
  let stage = userStage != null ? userStage : buildStage
  if (typeof stage == 'number') {
    presets.push(require.resolve(`babel-preset-stage-${stage}`))
    // Decorators are stage 2 but not supported by Babel yet - add the legacy
    // transform for support in the meantime.
    if (stage <= 2) {
      plugins.push(require.resolve('babel-plugin-transform-decorators-legacy'))
    }
  }

  if (userPresets) {
    presets = presets.concat(userPresets)
  }

  let config: BabelConfig = {presets}

  plugins = plugins.concat(buildPlugins, userPlugins)

  // App builds use the 'react-prod' preset to remove/wrap propTypes, component
  // builds use this config instead.
  if (buildRemovePropTypes) {
    // User config can disable removal of propTypes
    if (userRemovePropTypes !== false) {
      plugins.push(
        [require.resolve('babel-plugin-transform-react-remove-prop-types'), {
          ...typeof buildRemovePropTypes === 'object' ? buildRemovePropTypes : {},
          ...typeof userRemovePropTypes === 'object' ? userRemovePropTypes : {}
        }]
      )
    }
  }

  // The Runtime transform imports various things into a module based on usage.
  // Turn regenerator on by default to enable use of async/await and generators
  // without configuration.
  let runtimeTransformOptions: Object = {
    helpers: false,
    polyfill: false,
    regenerator: true,
  }
  if (setRuntimePath !== false) {
    runtimeTransformOptions.moduleName = RUNTIME_PATH
  }
  if (userRuntime !== false) {
    if (userRuntime === true) {
      // Enable all features
      runtimeTransformOptions = {}
      if (setRuntimePath !== false) {
        runtimeTransformOptions.moduleName = RUNTIME_PATH
      }
    }
    else if (typeOf(userRuntime) === 'string') {
      // Enable the named feature
      runtimeTransformOptions[userRuntime] = true
    }
    plugins.push([require.resolve('babel-plugin-transform-runtime'), runtimeTransformOptions])
  }

  // Allow Babel to parse (but not transform) import() when used with Webpack
  if (webpack) {
    plugins.push(require.resolve('babel-plugin-syntax-dynamic-import'))
  }

  // Provide CommonJS interop so users don't have to tag a .default onto their
  // imports if they're using vanilla Node.js require().
  if (commonJSInterop) {
    plugins.push(require.resolve('babel-plugin-add-module-exports'))
  }

  // The lodash plugin supports generic cherry-picking for named modules
  if (cherryPick) {
    plugins.push([require.resolve('babel-plugin-lodash'), {id: cherryPick}])
  }

  if (plugins.length > 0) {
    config.plugins = plugins
  }

  // Finally, give the user a chance to do whatever they want with the generated
  // config.
  if (typeof userConfigFunction === 'function') {
    config = userConfigFunction(config)
    if (!config) {
      throw new UserError(`babel.config() in ${userConfigPath} didn't return anything - it must return the Babel config object.`)
    }
  }

  return config
}
