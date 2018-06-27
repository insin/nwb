/* global NWB_QUICK_MOUNT_ID */

let React = require('react')
let ReactDOM = require('react-dom')

let parent = document.getElementById(NWB_QUICK_MOUNT_ID)
let element = null

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports a
  // React component (which is either a function or class) or element (which has
  // type and props properties).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    element = React.createElement(exported)
  }
  else if (exported.type && exported.props) {
    element = exported
  }
  else {
    // Assumption: the entry module rendered the app
    return
  }
  ReactDOM.render(element, parent)
}

function init() {
  renderEntry(require('nwb-quick-entry'))
}

if (module.hot) {
  module.hot.accept('nwb-quick-entry', init)
}

init()
