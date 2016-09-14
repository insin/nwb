import Component from 'nwb-react-run-entry'
import React from 'react'
import ReactDOM from 'react-dom'

let alreadyRendered = document.getElementById(NWB_REACT_RUN_MOUNT_ID).childNodes.length > 0 // eslint-disable-line no-undef

function render(Component) {
  // Don't attempt to render if there was already something rendered,
  // or if nothing was exported (assumption: they rendered somewhere else and
  // didn't export anything)
  if (alreadyRendered ||
      !(typeof Component === 'function' || Object.keys(Component).length > 0)) {
    return
  }

  // Assumption: either a React component or element was exported
  // If a React component was exported, create an element
  if (typeof Component === 'function' || !(Component.type && Component.props)) {
    Component = React.createElement(Component)
  }

  // Component should now be a React element
  ReactDOM.render(Component, document.getElementById(NWB_REACT_RUN_MOUNT_ID)) // eslint-disable-line no-undef
}

render(Component)

if (module.hot) {
  module.hot.accept('nwb-react-run-entry', () => {
    render(require('nwb-react-run-entry'))
  })
}
