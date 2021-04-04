// @flow
import path from 'path'

import {UserError} from './errors'

type BabelPluginConfig = string | [string, Object];

type BabelConfig = {
  targets?: string | string[],
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
  targets?: string | string[],
  webpack?: boolean,
};

type BrowserOptions = {
  development?: string | string[],
  production?: string | string[],
}

type UserOptions = {
  cherryPick?: string | string[],
  config?: (BabelConfig) => BabelConfig,
  env?: Object,
  loose?: boolean,
  plugins?: BabelPluginConfig[],
  presets?: BabelPluginConfig[],
  proposals?: false | Object,
  react?: Object,
  reactConstantElements?: boolean,
  removePropTypes?: false | Object,
  runtime?: false | Object,
};

export default function createBabelConfig(
  buildConfig: BuildOptions = {},
  userConfig: UserOptions = {},
  userConfigPath: string = '',
  userConfigBrowsers: BrowserOptions = {},
): BabelConfig {
  let {
    absoluteRuntime,
    commonJSInterop,
    env: buildEnv = {},
    modules = false,
    plugins: buildPlugins = [],
    presets: buildPresets,
    proposals: buildProposals = {},
    removePropTypes: buildRemovePropTypes = false,
    runtime: buildRuntime,
    targets: buildTargets,
    webpack = true,
  } = buildConfig

  let {
    cherryPick,
    config: userConfigFunction,
    env: userEnv = {},
    loose,
    plugins: userPlugins = [],
    presets: userPresets,
    proposals: userProposals = {},
    react = {},
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

  // Build config controls whether or not we set browser targets. Users can
  // override this using `browsers` or `babel.targets` config.
  let targetsConfig = {}
  if (buildTargets) {
    targetsConfig.targets = buildTargets
    let userTargets = userConfigBrowsers && (
      process.env.NODE_ENV === 'production'
        ? userConfigBrowsers.production
        : userConfigBrowsers.development
    )
    if (userTargets) {
      targetsConfig.targets = userTargets
    }
  }

  presets.push(
    [require.resolve('@babel/preset-env'), {
      loose,
      ...buildEnv,
      modules,
      // The user gets a last go at all the env options
      ...userEnv
    }]
  )

  // Additional build presets
  if (Array.isArray(buildPresets)) {
    buildPresets.forEach(preset => {
      // Presets which are configurable via user config are specified by name so
      // customisation can be handled in this module.
      if (preset === 'react') {
        presets.push(
          [require.resolve('@babel/preset-react'), {
            development: process.env.NODE_ENV !== 'production',
            ...react
          }]
        )
      }
      else if (preset === 'react-prod') {
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

  let config: BabelConfig = {...targetsConfig, presets}

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
