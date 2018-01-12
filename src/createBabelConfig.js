// @flow
import path from 'path'

import {UserError} from './errors'

type BabelPluginConfig = string | [string, Object];

type BabelConfig = {
  presets: BabelPluginConfig[],
  plugins?: BabelPluginConfig[],
};

type BuildOptions = {
  absoluteRuntime?: false,
  commonJSInterop?: boolean,
  env?: Object,
  modules?: false | string,
  plugins?: BabelPluginConfig[],
  presets?: BabelPluginConfig[],
  proposals?: Object,
  removePropTypes?: true | Object,
  runtime?: Object,
  webpack?: boolean,
};

type UserOptions = {
  cherryPick?: string | string[],
  config?: (BabelConfig) => BabelConfig,
  env?: Object,
  loose?: boolean,
  plugins?: BabelPluginConfig[],
  presets?: BabelPluginConfig[],
  proposals?: false | Object,
  reactConstantElements?: boolean,
  removePropTypes?: false | Object,
  runtime?: false | Object,
};

export default function createBabelConfig(
  buildConfig: BuildOptions = {},
  userConfig: UserOptions = {},
  userConfigPath: string = ''
): BabelConfig {
  let {
    absoluteRuntime,
    commonJSInterop,
    modules = false,
    plugins: buildPlugins = [],
    presets: buildPresets,
    proposals: buildProposals = {},
    removePropTypes: buildRemovePropTypes = false,
    runtime: buildRuntime,
    webpack = true,
  } = buildConfig

  let {
    cherryPick,
    config: userConfigFunction,
    env = {},
    loose,
    plugins: userPlugins = [],
    presets: userPresets,
    proposals: userProposals = {},
    reactConstantElements,
    removePropTypes: userRemovePropTypes,
    runtime: userRuntime,
  } = userConfig

  let presets: BabelPluginConfig[] = []
  let plugins: BabelPluginConfig[] = []

  // Default to loose mode unless explicitly configured
  if (typeof loose === 'undefined') {
    loose = true
  }

  presets.push(
    [require.resolve('@babel/preset-env'), {loose, modules, ...env}]
  )

  // Additional build presets
  if (Array.isArray(buildPresets)) {
    buildPresets.forEach(preset => {
      // Presets which are configurable via user config are specified by name so
      // customisation can be handled in this module.
      if (preset === 'react-prod') {
        // Hoist static element subtrees up so React can skip them when reconciling
        if (reactConstantElements !== false) {
          plugins.push(require.resolve('@babel/plugin-transform-react-constant-elements'))
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
        presets.push(preset)
      }
    })
  }

  // Proposal plugins
  if (userProposals !== false) {
    presets.push([require.resolve('babel-preset-proposals'), {
      // Pass on nwb's loose = true default
      loose,
      decorators: true,
      classProperties: true,
      exportDefaultFrom: true,
      exportNamespaceFrom: true,
      ...buildProposals,
      ...userProposals,
      // Required for non-local usage of nwb
      absolutePaths: true
    }])
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

  // The Runtime transform imports helpers and the regenerator runtime when required
  // See https://babeljs.io/docs/en/babel-plugin-transform-runtime.html
  if (userRuntime !== false) {
    plugins.push([require.resolve('@babel/plugin-transform-runtime'), {
      absoluteRuntime: absoluteRuntime !== false ? path.resolve(__dirname, '..') : false,
      useESModules: modules === false,
      ...typeof buildRuntime === 'object' ? buildRuntime : {},
      ...typeof userRuntime === 'object' ? userRuntime : {}
    }])
  }

  // Allow Babel to parse (but not transform) import() when used with Webpack
  if (webpack) {
    plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))
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
