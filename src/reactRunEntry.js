/* global NWB_REACT_RUN_MOUNT_ID */

import {createElement} from 'react'
import {render} from 'react-dom'

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports a
  // React component (which is either a function or class) or element (which has
  // type and props properties).
  let element
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    element = createElement(exported)
  }
  else if (exported.type && exported.props) {
    element = exported
  }
  if (element) {
    render(element, document.getElementById(NWB_REACT_RUN_MOUNT_ID))
  }
}

renderEntry(require('nwb-react-run-entry'))

if (module.hot) {
  module.hot.accept('nwb-react-run-entry', () => {
    renderEntry(require('nwb-react-run-entry'))
  })
}
