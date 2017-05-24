import {createServeCommandConfig} from './appConfig'

export default function createServeInfernoAppConfig(args, middlewareConfig) {
  return createServeCommandConfig(args, {
    babel: {
      presets: ['inferno'],
    },
    resolve: {
      alias: {
        'react': 'inferno-compat',
        'react-dom': 'inferno-compat',
      }
    },
  }, middlewareConfig)
}
