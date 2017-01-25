import './index.css'

import {h, render} from 'preact'

let root
function init() {
  let App = require('./App').default
  root = render(<App/>, document.querySelector('#app'), root)
}

init()

if (module.hot) {
  module.hot.accept('./App', () => window.requestAnimationFrame(() => {
    init()
  }))
}
