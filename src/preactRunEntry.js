/* global NWB_PREACT_RUN_MOUNT_ID */

// Hook preact's render function to get the VNode passed by the entry if it's
// rendering itself.
// h/t @developit
let preact = require('preact')
let {h, render} = preact
let root = null
let vnode = null
preact.render = (v) => {
  vnode = v
}

function renderEntry(exported) {
  // Assumptions: the entry module either renders the app itself or exports a
  // Preact component (which is either a function or class) or VNode (which has
  // a children property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = h(exported)
  }
  else if (exported.children) {
    vnode = exported
  }
  root = render(vnode, document.getElementById(NWB_PREACT_RUN_MOUNT_ID), root)
}

renderEntry(require('nwb-preact-run-entry'))

if (module.hot) {
  module.hot.accept('nwb-preact-run-entry', () => {
    renderEntry(require('nwb-preact-run-entry'))
  })
}
