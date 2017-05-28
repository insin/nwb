import './Child2.css'

import React, {Component} from 'react'

class Child2 extends Component {
  render() {
    let {site} = this.props.routeParams
    return <div className="Child2">
      <h2>Child 2</h2>
      <img src="/subdir/shyamalan.jpg"/>
      {site && <p>Site param: {site}</p>}
    </div>
  }
}

export default Child2
