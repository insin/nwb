import {typeOf} from './utils'

const DEFAULT_STAGE = 2

export default function createBabelConfig(buildConfig = {}, userConfig = {}) {
  let {
    nativeModules,
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

  // Default to loose mode unless explicitly configured
  if (typeOf(loose) === 'undefined') {
    loose = true
  }

  // ES2015 and ES2016 presets
  presets.push(
    require.resolve(
      `../babel-presets/es2015${nativeModules ? '-native-modules' : ''}${loose ? '-loose' : ''}`,
    ),
    require.resolve('babel-preset-es2016'),
  )

  // Stage preset
  let stage = userStage != null ? userStage : buildStage
  if (typeof stage == 'number') {
    presets.push(
      require.resolve(`../babel-presets/stage-${stage}`)
    )
  }

  // Additional build presets
  if (Array.isArray(buildPresets)) {
    buildPresets.forEach(preset => {
      presets.push(require.resolve(`../babel-presets/${preset}`))
    })
  }

  if (userPresets) {
    presets = [...presets, ...userPresets]
  }

  let config = {presets}

  let plugins = [...buildPlugins, ...userPlugins]

  // The Runtime transform imports various things into a module based on usage.
  // Turn regenerator on by default to enable use of async/await and generators
  // without configuration.
  let runtimeTransformOptions = {
    helpers: false,
    polyfill: false,
    regenerator: true,
  }
  if (userRuntime !== false) {
    if (userRuntime === true) {
      // Enable all features
      runtimeTransformOptions = {}
    }
    else if (typeOf(userRuntime) === 'string') {
      // Enable the named feature
      runtimeTransformOptions[userRuntime] = true
    }
    plugins.push([require.resolve('babel-plugin-transform-runtime'), runtimeTransformOptions])
  }

  // The lodash plugin support generic cherry-picking for named modules
  if (cherryPick) {
    plugins.push([require.resolve('babel-plugin-lodash'), {id: cherryPick}])
  }

  if (plugins.length > 0) {
    config.plugins = plugins
  }

  return config
}
