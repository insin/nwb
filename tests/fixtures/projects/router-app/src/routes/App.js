import './App.css'

import t from 'prop-types'
import React, {Component} from 'react'
import {Link} from 'react-router'

import Thing from 'src/components/Thing'

class App extends Component {
  propTypes = {
    test: t.string // eslint-disable-line react/no-unused-prop-types
  }

  render() {
    return <div>
      <h1>Welcome to React</h1>
      <Thing/>
      <hr/>
      <ul>
        <li><Link activeClassName="active" to="/child1">Child 1</Link></li>
        <li><Link activeClassName="active" to="/child2/test.com">Child 2</Link></li>
      </ul>
      <hr/>
      {this.props.children}
    </div>
  }
}

export default App
