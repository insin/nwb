import expect from 'expect'

import createBabelConfig from '../src/createBabelConfig'

let DEFAULT_RUNTIME_CONFIG =
  [require.resolve('babel-plugin-transform-runtime'), {
    helpers: false,
    polyfill: false,
    regenerator: true,
  }]

describe('createBabelConfig()', () => {
  context('without any build or user config', () => {
    it('generates default Babel config', () => {
      expect(createBabelConfig()).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose'),
          require.resolve('babel-preset-es2016'),
          require.resolve('../babel-presets/stage-2'),
        ],
        plugins: [DEFAULT_RUNTIME_CONFIG]
      })
    })
  })

  context('with build config', () => {
    it('generates build-configured Babel config', () => {
      expect(createBabelConfig({
        nativeModules: true,
        presets: ['react', 'react-hmre'],
        stage: 0,
        env: {
          development: {
            plugins: ['test-env-plugin']
          }
        },
      })).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-native-modules-loose'),
          require.resolve('babel-preset-es2016'),
          require.resolve('../babel-presets/stage-0'),
          require.resolve('../babel-presets/react'),
          require.resolve('../babel-presets/react-hmre'),
        ],
        plugins: [DEFAULT_RUNTIME_CONFIG],
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
          require.resolve('../babel-presets/es2015'),
          require.resolve('babel-preset-es2016'),
          require.resolve('../babel-presets/stage-0'),
          'test-preset',
        ],
        plugins: [
          'test-plugin',
          [require.resolve('babel-plugin-transform-runtime'), {}]
        ],
      })
    })
    it('chooses runtime transform config', () => {
      ['helpers', 'polyfill'].forEach(runtime => {
        expect(createBabelConfig({}, {
          runtime,
        })).toEqual({
          presets: [
            require.resolve('../babel-presets/es2015-loose'),
            require.resolve('babel-preset-es2016'),
            require.resolve('../babel-presets/stage-2'),
          ],
          plugins: [
            [require.resolve('babel-plugin-transform-runtime'), {
              helpers: false,
              polyfill: false,
              regenerator: true,
              [runtime]: true,
            }]
          ]
        })
      })
    })
  })

  context('with build and user config', () => {
    it('overrides build stage config with user stage config', () => {
      expect(createBabelConfig({stage: 3}, {stage: 1})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose'),
          require.resolve('babel-preset-es2016'),
          require.resolve('../babel-presets/stage-1'),
        ],
        plugins: [DEFAULT_RUNTIME_CONFIG]
      })
    })
    it('cancels default stage config', () => {
      expect(createBabelConfig({}, {stage: false})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose'),
          require.resolve('babel-preset-es2016'),
        ],
        plugins: [DEFAULT_RUNTIME_CONFIG]
      })
    })
    it('cancels default runtime config', () => {
      expect(createBabelConfig({}, {runtime: false})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose'),
          require.resolve('babel-preset-es2016'),
          require.resolve('../babel-presets/stage-2'),
        ],
      })
    })
  })
})
