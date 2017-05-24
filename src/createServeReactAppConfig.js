import {createServeCommandConfig} from './appConfig'

export default function createServeReactAppConfig(args, middlewareConfig) {
  let config = {
    babel: {
      presets: ['react'],
    }
  }

  if (args.hmr !== false && args.hmre !== false) {
    config.babel.presets.push('react-hmre')
  }

  return createServeCommandConfig(args, config, middlewareConfig)
}
