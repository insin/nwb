import {createServeCommandConfig} from './appConfig'

export default function createServeWebAppConfig(args, middlewareConfig) {
  return createServeCommandConfig(args, middlewareConfig)
}
