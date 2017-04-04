import './index.css'

import Inferno from 'inferno'

import App from './App'

Inferno.render(<App/>, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}
