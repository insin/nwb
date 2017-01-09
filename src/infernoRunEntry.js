/* global NWB_INFERNO_RUN_MOUNT_ID */

// Hook Inferno's render function to get the VNode passed by the entry if it's
// rendering itself.
let Inferno = require('inferno')
let {createVNode, render} = Inferno
let vnode = null
Inferno.render = (v) => {
  vnode = v
}

function renderEntry(exported) {
  // Assumptions: the entry module either renders the app itself or exports an
  // Inferno component (which is either a function or class) or VNode (which has
  // a flags property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = createVNode(1 << 4 /* === VNodeFlags.ComponentUnknown */, exported)
  }
  else if (exported.flags) {
    vnode = exported
  }
  render(vnode, document.getElementById(NWB_INFERNO_RUN_MOUNT_ID))
}

renderEntry(require('nwb-inferno-run-entry'))

if (module.hot) {
  module.hot.accept('nwb-inferno-run-entry', () => {
    renderEntry(require('nwb-inferno-run-entry'))
  })
}
