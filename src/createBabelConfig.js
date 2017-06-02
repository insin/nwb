// @flow
import path from 'path'

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
  userConfig: UserOptions = {}
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

  // ES2015 and ES2016 presets
  presets.push(
    [require.resolve('babel-preset-es2015'), {loose, modules}],
    require.resolve('babel-preset-es2016'),
  )

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

  // Additional build presets
  if (Array.isArray(buildPresets)) {
    buildPresets.forEach(preset => {
      if (preset === 'inferno') {
        presets.push(require.resolve('../babel-presets/inferno'))
      }
      else if (preset === 'preact') {
        presets.push(require.resolve('../babel-presets/preact'))
      }
      else if (preset === 'react') {
        presets.push(require.resolve('babel-preset-react'))
        if (process.env.NODE_ENV === 'development') {
          plugins.push(
            require.resolve('babel-plugin-transform-react-jsx-source'),
            require.resolve('babel-plugin-transform-react-jsx-self')
          )
        }
      }
      else if (preset === 'react-hmre') {
        presets.push(require.resolve('../babel-presets/react-hmre'))
      }
      else if (preset === 'react-prod') {
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
      else {
        throw new Error(`Unknown build preset: ${preset}`)
      }
    })
  }

  if (userPresets) {
    presets = [...presets, ...userPresets]
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

  return config
}
