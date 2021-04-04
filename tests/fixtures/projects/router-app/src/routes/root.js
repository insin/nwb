import React from 'react'
import {Route} from 'react-router'

import App from './App'

let routes = <Route path="/" component={App}>
  <Route
    path="child1"
    getComponent={
      (nextState, cb) => {
        import(/* webpackChunkName: "child1" */ './child1/Child1')
          .then(component => cb(null, component))
          .catch(error => cb(error))
      }
    }
  />
  <Route
    path="child2(/:site)"
    getComponent={
      (nextState, cb) => {
        import(/* webpackChunkName: "child2" */ './child2/Child2')
          .then(component => cb(null, component))
          .catch(error => cb(error))
      }
    }
  />
</Route>

export default routes
