// @flow
import path from 'path'

import expect from 'expect'

import createBabelConfig from '../src/createBabelConfig'

let ABSOLUTE_RUNTIME_PATH = path.resolve(__dirname, '..')

let DEFAULT_RUNTIME_CONFIG =
  [require.resolve('@babel/plugin-transform-runtime'), {
    absoluteRuntime: ABSOLUTE_RUNTIME_PATH,
    useESModules: true,
  }]

let DEFAULT_PROPOSALS_CONFIG =
  [require.resolve('babel-preset-proposals'), {
    absolutePaths: true,
    classProperties: true,
    decorators: true,
    exportDefaultFrom: true,
    exportNamespaceFrom: true,
    loose: true,
  }]

describe('createBabelConfig()', () => {
  context('without any build or user config', () => {
    it('generates default Babel config', () => {
      expect(createBabelConfig()).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          DEFAULT_PROPOSALS_CONFIG,
        ],
        plugins: [
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
  })

  context('with build config', () => {
    it('generates build-configured Babel config', () => {
      expect(createBabelConfig({
        modules: 'commonjs',
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: 'commonjs'}],
          DEFAULT_PROPOSALS_CONFIG,
        ],
        plugins: [
          [require.resolve('@babel/plugin-transform-runtime'), {
            absoluteRuntime: ABSOLUTE_RUNTIME_PATH,
            useESModules: false,
          }],
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ],
      })
    })
    it('adds plugins given the "react-prod" preset', () => {
      expect(createBabelConfig({
        presets: ['react-prod'],
      }, {
        proposals: false,
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
        ],
        plugins: [
          require.resolve('@babel/plugin-transform-react-constant-elements'),
          [require.resolve('babel-plugin-transform-react-remove-prop-types'), {}],
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ],
      })
    })
    it('adds the propType removal plugin given removePropTypes config', () => {
      expect(createBabelConfig({
        removePropTypes: true,
      }, {
        proposals: false,
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
        ],
        plugins: [
          [require.resolve('babel-plugin-transform-react-remove-prop-types'), {}],
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ],
      })
    })
    it('prevents an absolute runtime path being configured for transform-runtime', () => {
      expect(createBabelConfig({
        absoluteRuntime: false,
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          DEFAULT_PROPOSALS_CONFIG,
        ],
        plugins: [
          [require.resolve('@babel/plugin-transform-runtime'), {
            absoluteRuntime: false,
            useESModules: true,
          }],
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
  })

  context('with user config', () => {
    it('generates user-configured Babel config', () => {
      expect(createBabelConfig({}, {
        proposals: {
          numericSeparator: true
        },
        loose: false,
        plugins: ['test-plugin'],
        presets: ['test-preset'],
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: false, modules: false}],
          [require.resolve('babel-preset-proposals'), {
            absolutePaths: true,
            classProperties: true,
            decorators: true,
            exportDefaultFrom: true,
            exportNamespaceFrom: true,
            loose: false,
            numericSeparator: true,
          }],
          'test-preset',
        ],
        plugins: [
          'test-plugin',
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ],
      })
    })
    it('disables runtime transform helpers', () => {
      expect(createBabelConfig({}, {
        runtime: {helpers: false},
      })).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          DEFAULT_PROPOSALS_CONFIG,
        ],
        plugins: [
          [require.resolve('@babel/plugin-transform-runtime'), {
            absoluteRuntime: ABSOLUTE_RUNTIME_PATH,
            useESModules: true,
            helpers: false,
          }],
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
  })

  context('with build and user config', () => {
    it('overrides build proposals config with user proposals config', () => {
      expect(createBabelConfig({proposals: {numericSeparator: true}}, {proposals: {numericSeparator: false}})).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          [require.resolve('babel-preset-proposals'), {
            absolutePaths: true,
            classProperties: true,
            decorators: true,
            exportDefaultFrom: true,
            exportNamespaceFrom: true,
            loose: true,
            numericSeparator: false,
          }]
        ],
        plugins: [
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
    it('overrides default proposals config', () => {
      expect(createBabelConfig({}, {proposals: {decorators: false}})).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          [require.resolve('babel-preset-proposals'), {
            absolutePaths: true,
            classProperties: true,
            decorators: false,
            exportDefaultFrom: true,
            exportNamespaceFrom: true,
            loose: true,
          }]
        ],
        plugins: [
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
    it('cancels default proposals config', () => {
      expect(createBabelConfig({}, {proposals: false})).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
        ],
        plugins: [
          DEFAULT_RUNTIME_CONFIG,
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
    it('cancels default runtime config', () => {
      expect(createBabelConfig({}, {runtime: false})).toEqual({
        presets: [
          [require.resolve('@babel/preset-env'), {loose: true, modules: false}],
          DEFAULT_PROPOSALS_CONFIG,
        ],
        plugins: [
          require.resolve('@babel/plugin-syntax-dynamic-import'),
        ]
      })
    })
  })
})
