import path from 'path'

import {typeOf} from './utils'

const DEFAULT_STAGE = 2

export default function createBabelConfig(buildConfig = {}, userConfig = {}) {
  let {
    commonJSInterop,
    env,
    modules = 'commonjs',
    plugins: buildPlugins = [],
    presets: buildPresets,
    stage: buildStage = DEFAULT_STAGE,
  } = buildConfig

  let {
    cherryPick,
    loose,
    plugins: userPlugins = [],
    presets: userPresets,
    runtime: userRuntime,
    stage: userStage,
  } = userConfig

  let presets = []
  let plugins = []

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
      if (preset === 'react') {
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
        presets.push(require.resolve('../babel-presets/react-prod'))
      }
      else {
        throw new Error(`Unknown build preset: ${preset}`)
      }
    })
  }

  if (userPresets) {
    presets = [...presets, ...userPresets]
  }

  let config = {presets}

  plugins = plugins.concat(buildPlugins, userPlugins)

  // The Runtime transform imports various things into a module based on usage.
  // Turn regenerator on by default to enable use of async/await and generators
  // without configuration.
  let runtimeTransformOptions = {
    helpers: false,
    polyfill: false,
    regenerator: true,
    moduleName: path.dirname(require.resolve('babel-runtime/package')),
  }
  if (userRuntime !== false) {
    if (userRuntime === true) {
      // Enable all features
      runtimeTransformOptions = {
        moduleName: path.dirname(require.resolve('babel-runtime/package')),
      }
    }
    else if (typeOf(userRuntime) === 'string') {
      // Enable the named feature
      runtimeTransformOptions[userRuntime] = true
    }
    plugins.push([require.resolve('babel-plugin-transform-runtime'), runtimeTransformOptions])
  }

  // Provide CommonJS interop so require() in code-splitting require.ensure()
  // blocks doesn't need a .default tacked on the end.
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

  // Pass any given env config through
  if (env) {
    config.env = env
  }

  return config
}
