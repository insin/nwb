/* global NWB_INFERNO_RUN_MOUNT_ID */

let Inferno = require('inferno')
let {createVNode, render} = Inferno
let parent = document.getElementById(NWB_INFERNO_RUN_MOUNT_ID)
let vnode = null

function renderEntry(exported) {
  if (exported.default) {
    exported = exported.default
  }
  // Assumptions: the entry module either renders the app itself or exports an
  // Inferno component (which is either a function or class) or VNode (which has
  // a flags property).
  if (Object.prototype.toString.call(exported) === '[object Function]') {
    vnode = createVNode(1 << 4 /* === VNodeFlags.ComponentUnknown */, exported)
  }
  else if (exported.flags) {
    vnode = exported
  }
  render(vnode, parent)
}

function init() {
  // Hijack any inline render() from the entry module, but only the first one -
  // others may be from components like portals which need to render() their
  // contents.
  Inferno.render = (v) => {
    vnode = v
    Inferno.render = render
  }
  let entry = require('nwb-inferno-run-entry')
  Inferno.render = render
  renderEntry(entry)
}

if (module.hot) {
  module.hot.accept('nwb-inferno-run-entry', init)
}

init()
