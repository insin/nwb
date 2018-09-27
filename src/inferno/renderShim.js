/* global NWB_QUICK_MOUNT_ID */

let Inferno = require('inferno')

let parent = document.getElementById(NWB_QUICK_MOUNT_ID)
let vnode = null

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports an
  // Inferno component (which is either a function or class) or VNode (which has
  // a flags property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = Inferno.createComponentVNode(1 << 1 /* === VNodeFlags.ComponentUnknown */, exported)
  }
  else if (exported.flags) {
    vnode = exported
  }
  else {
    // Assumption: the entry module rendered the app
    return
  }
  Inferno.render(vnode, parent)
}

function init() {
  renderEntry(require('nwb-quick-entry'))
}

if (module.hot) {
  module.hot.accept('nwb-quick-entry', init)
}

init()
