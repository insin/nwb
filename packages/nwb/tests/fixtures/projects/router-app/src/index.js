import 'bootstrap/dist/css/bootstrap.css'

import React from 'react'
import {render} from 'react-dom'
import {browserHistory, Router} from 'react-router'

import routes from './routes/root'

render(
  <Router routes={routes} history={browserHistory}/>,
  document.querySelector('#app')
)
