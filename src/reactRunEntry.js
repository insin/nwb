/* global NWB_REACT_RUN_MOUNT_ID */
import Component from 'nwb-react-run-entry'
import React from 'react'
import ReactDOM from 'react-dom'

function render(Component) {
  // Assumptions: the entry module either renders the app itself or exports a
  // React component (which is either a function or class) or element (which has
  // type and props properties).
  if (Object.prototype.toString.call(Component) === '[object Function]' ||
      (Component.type && Component.props)) {
    if (!(Component.type && Component.props)) {
      Component = React.createElement(Component)
    }
    // Component should now be a React element
    ReactDOM.render(Component, document.getElementById(NWB_REACT_RUN_MOUNT_ID))
  }
}

render(Component)

if (module.hot) {
  module.hot.accept('nwb-react-run-entry', () => {
    render(require('nwb-react-run-entry'))
  })
}
