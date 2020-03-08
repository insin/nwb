/* global NWB_QUICK_MOUNT_ID */

// Enable use of Preact Devtools
if (process.env.NODE_ENV === 'development') {
  require('preact/debug')
}

let Preact = require('preact')

let parent = document.getElementById(NWB_QUICK_MOUNT_ID)
let root = parent.firstElementChild
let vnode = null

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports a
  // Preact component (which is either a function or class) or VNode (which has
  // a children property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = Preact.h(exported)
  }
  else if (exported.children) {
    vnode = exported
  }
  else {
    // Assumption: the entry module rendered the app
    return
  }
  root = Preact.render(vnode, parent, root)
}

function init() {
  renderEntry(require('nwb-quick-entry'))
}

if (module.hot) {
  module.hot.accept('nwb-quick-entry', init)
}

init()
