/* global NWB_QUICK_MOUNT_ID */

// h/t to @developit for this render shim module
let Preact = require('preact')
let {h, render} = Preact
let parent = document.getElementById(NWB_QUICK_MOUNT_ID)
let root = parent.firstChild // If #app already contains elements, hydrate from them (for SSR)
let vnode = null

if (process.env.NODE_ENV === 'development') {
  // Enable Preact debug output and use of React Developer Tools
  require('preact/debug')
}

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports a
  // Preact component (which is either a function or class) or VNode (which has
  // a children property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = h(exported)
  }
  else if (exported.children) {
    vnode = exported
  }
  else {
    // Assumption: the entry module rendered the app
    return
  }
  root = render(vnode, parent, root)
}

function init() {
  renderEntry(require('nwb-quick-entry'))
}

if (module.hot) {
  module.hot.accept('nwb-quick-entry', init)
}

init()
