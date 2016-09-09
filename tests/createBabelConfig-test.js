import path from 'path'

import expect from 'expect'

import createBabelConfig from '../src/createBabelConfig'

let babelRuntimePath = path.dirname(require.resolve('babel-runtime/package'))

let DEFAULT_RUNTIME_CONFIG =
  [require.resolve('babel-plugin-transform-runtime'), {
    helpers: false,
    polyfill: false,
    regenerator: true,
    moduleName: babelRuntimePath,
  }]

describe('createBabelConfig()', () => {
  context('without any build or user config', () => {
    it('generates default Babel config', () => {
      expect(createBabelConfig()).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: true, modules: 'commonjs'}],
          require.resolve('babel-preset-es2016'),
          require.resolve('babel-preset-stage-2'),
        ],
        plugins: [
          require.resolve('babel-plugin-transform-decorators-legacy'),
          DEFAULT_RUNTIME_CONFIG,
        ]
      })
    })
  })

  context('with build config', () => {
    it('generates build-configured Babel config', () => {
      expect(createBabelConfig({
        modules: false,
        presets: ['react', 'react-hmre'],
        stage: 0,
        env: {
          development: {
            plugins: ['test-env-plugin']
          }
        },
      })).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: true, modules: false}],
          require.resolve('babel-preset-es2016'),
          require.resolve('babel-preset-stage-0'),
          require.resolve('babel-preset-react'),
          require.resolve('../babel-presets/react-hmre'),
        ],
        plugins: [
          require.resolve('babel-plugin-transform-decorators-legacy'),
          DEFAULT_RUNTIME_CONFIG,
        ],
        env: {
          development: {
            plugins: ['test-env-plugin']
          }
        },
      })
    })
  })

  context('with user config', () => {
    it('generates user-configured Babel config', () => {
      expect(createBabelConfig({}, {
        stage: 0,
        loose: false,
        runtime: true,
        plugins: ['test-plugin'],
        presets: ['test-preset'],
      })).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: false, modules: 'commonjs'}],
          require.resolve('babel-preset-es2016'),
          require.resolve('babel-preset-stage-0'),
          'test-preset',
        ],
        plugins: [
          require.resolve('babel-plugin-transform-decorators-legacy'),
          'test-plugin',
          [require.resolve('babel-plugin-transform-runtime'), {
            moduleName: babelRuntimePath,
          }],
        ],
      })
    })
    it('chooses runtime transform config', () => {
      ['helpers', 'polyfill'].forEach(runtime => {
        expect(createBabelConfig({}, {
          runtime,
        })).toEqual({
          presets: [
            [require.resolve('babel-preset-es2015'), {loose: true, modules: 'commonjs'}],
            require.resolve('babel-preset-es2016'),
            require.resolve('babel-preset-stage-2'),
          ],
          plugins: [
            require.resolve('babel-plugin-transform-decorators-legacy'),
            [require.resolve('babel-plugin-transform-runtime'), {
              helpers: false,
              polyfill: false,
              regenerator: true,
              moduleName: babelRuntimePath,
              [runtime]: true,
            }],
          ]
        })
      })
    })
  })

  context('with build and user config', () => {
    it('overrides build stage config with user stage config', () => {
      expect(createBabelConfig({stage: 3}, {stage: 1})).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: true, modules: 'commonjs'}],
          require.resolve('babel-preset-es2016'),
          require.resolve('babel-preset-stage-1'),
        ],
        plugins: [
          require.resolve('babel-plugin-transform-decorators-legacy'),
          DEFAULT_RUNTIME_CONFIG,
        ]
      })
    })
    it('cancels default stage config', () => {
      expect(createBabelConfig({}, {stage: false})).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: true, modules: 'commonjs'}],
          require.resolve('babel-preset-es2016'),
        ],
        plugins: [
          DEFAULT_RUNTIME_CONFIG,
        ]
      })
    })
    it('cancels default runtime config', () => {
      expect(createBabelConfig({}, {runtime: false})).toEqual({
        presets: [
          [require.resolve('babel-preset-es2015'), {loose: true, modules: 'commonjs'}],
          require.resolve('babel-preset-es2016'),
          require.resolve('babel-preset-stage-2'),
        ],
        plugins: [
          require.resolve('babel-plugin-transform-decorators-legacy'),
        ]
      })
    })
  })
})
