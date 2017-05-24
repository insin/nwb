import {createServeCommandConfig} from './appConfig'

export default function createServePreactAppConfig(args, middlewareConfig) {
  return createServeCommandConfig(args, {
    babel: {
      presets: ['preact'],
    },
    resolve: {
      alias: {
        'react': 'preact-compat/dist/preact-compat',
        'react-dom': 'preact-compat/dist/preact-compat',
      }
    },
  }, middlewareConfig)
}
