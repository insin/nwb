export const CONFIG_FILE_NAME = 'nwb.config.js'

export const DEFAULT_PORT = process.env.PORT || 3000

export const INFERNO_APP = 'inferno-app'
export const PREACT_APP = 'preact-app'
export const REACT_APP = 'react-app'
export const REACT_COMPONENT = 'react-component'
export const WEB_APP = 'web-app'
export const WEB_MODULE = 'web-module'

export const PROJECT_TYPES = new Set([
  INFERNO_APP,
  PREACT_APP,
  REACT_APP,
  REACT_COMPONENT,
  WEB_APP,
  WEB_MODULE,
])
