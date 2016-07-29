if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable()
  window.Promise = require('promise/lib/es6-extensions.js')
}

require('whatwg-fetch')

// TODO Provide Symbol and Array.from polyfills so array destructuring,
//      for-of loops and array spread operator will work in non-ES2015
//      environments by default.
//      This also lets us add the inline element optimisation, which depends on
//      Symbol.
