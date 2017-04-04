import './index.css'

import {h, render} from 'preact'

let root
function init() {
  let App = require('./App').default
  root = render(<App/>, document.querySelector('#app'), root)
}

if (module.hot) {
  // require('preact/devtools') // Uncomment to enable use of React DevTools
  module.hot.accept('./App', () => requestAnimationFrame(init))
}

init()
