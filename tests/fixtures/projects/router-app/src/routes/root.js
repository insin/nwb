import React from 'react'
import {Route} from 'react-router'

import App from './App'

let routes = <Route path="/" component={App}>
  <Route
    path="child1"
    getComponent={
      (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('./child1/Child1').default)
        })
      }
    }
  />
  <Route
    path="child2(/:site)"
    getComponent={
      (nextState, cb) => {
        require.ensure([], (require) => {
          cb(null, require('./child2/Child2').default)
        })
      }
    }
  />
</Route>

export default routes
