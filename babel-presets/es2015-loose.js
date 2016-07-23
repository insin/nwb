var modify = require('modify-babel-preset')

var LOOSE = {loose: true}

module.exports = modify('babel-preset-es2015', {
  'transform-es2015-template-literals': LOOSE,
  'transform-es2015-classes': LOOSE,
  'transform-es2015-computed-properties': LOOSE,
  'transform-es2015-for-of': LOOSE,
  'transform-es2015-spread': LOOSE,
  'transform-es2015-destructuring': LOOSE,
  'transform-es2015-modules-commonjs': LOOSE
})
