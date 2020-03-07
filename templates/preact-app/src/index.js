if (process.env.NODE_ENV === 'development') {
  // Enable use of Preact Devtools
  require('preact/debug')
}

import './index.css'

import {h, render} from 'preact'

function init() {
  let App = require('./App').default
  render(<App/>, document.querySelector('#app'))
}

if (module.hot) {
  module.hot.accept('./App', init)
}

init()
