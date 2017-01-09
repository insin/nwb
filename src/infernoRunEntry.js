/* global NWB_INFERNO_RUN_MOUNT_ID */
import Component from 'nwb-inferno-run-entry'
import Inferno from 'inferno'

function render(Component) {
  // Assumptions: the entry module either renders the app itself or exports an
  // Inferno component (which is either a function or class) or VNode (which has
  // a flags property).
  if (Object.prototype.toString.call(Component) === '[object Function]' || Component.flags) {
    if (!Component.flags) {
      Component = Inferno.createVNode(
        1 << 4 /* === VNodeFlags.ComponentUnknown */,
        Component
      )
    }
    // Component should now be an Inferno VNode
    Inferno.render(Component, document.getElementById(NWB_INFERNO_RUN_MOUNT_ID))
  }
}

render(Component)

if (module.hot) {
  module.hot.accept('nwb-inferno-run-entry', () => {
    render(require('nwb-inferno-run-entry'))
  })
}
