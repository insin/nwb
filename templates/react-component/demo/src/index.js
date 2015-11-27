import React from 'react'
import {render} from 'react-dom'

import MyComponent from '../../src'

let Demo = React.createClass({
  render() {
    return <div>
        <h1>{{name}} Demo</h1>
        <MyComponent/>
      </div>
  }
})
