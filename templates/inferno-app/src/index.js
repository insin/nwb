import './index.css'

import {render} from 'inferno'

import App from './App'

render(<App/>, document.querySelector('#app'))

if (module.hot) {
  module.hot.accept()
}
