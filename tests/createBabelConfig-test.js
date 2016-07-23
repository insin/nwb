import expect from 'expect'

import createBabelConfig from '../src/createBabelConfig'

describe('createBabelConfig()', () => {
  context('without any build or user config', () => {
    it('generates default Babel config', () => {
      expect(createBabelConfig()).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015'),
          require.resolve('../babel-presets/stage-2'),
        ]
      })
    })
  })

  context('with build config', () => {
    it('generates build-configured Babel config', () => {
      expect(createBabelConfig({
        native: true,
        presets: ['react', 'react-hmre'],
        stage: 0,
        runtime: true,
      })).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-native'),
          require.resolve('../babel-presets/stage-0'),
          require.resolve('../babel-presets/react'),
          require.resolve('../babel-presets/react-hmre'),
          require.resolve('../babel-presets/runtime'),
        ],
      })
    })
  })

  context('with user config', () => {
    it('generates user-configured Babel config', () => {
      expect(createBabelConfig({}, {
        stage: 0,
        loose: true,
        runtime: true,
        plugins: ['test-plugin'],
        presets: ['test-preset'],
      })).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose'),
          require.resolve('../babel-presets/stage-0'),
          require.resolve('../babel-presets/runtime'),
          'test-preset',
        ],
        plugins: ['test-plugin'],
      })
    })
    it('chooses runtime transform config', () => {
      ['helpers', 'regenerator', 'polyfill'].forEach(runtime => {
        expect(createBabelConfig({}, {
          runtime,
        })).toEqual({
          presets: [
            require.resolve('../babel-presets/es2015'),
            require.resolve('../babel-presets/stage-2'),
            require.resolve(`../babel-presets/runtime-${runtime}`),
          ]
        })
      })
    })
  })

  context('with build and user config', () => {
    it('overrides build stage config with user stage config', () => {
      expect(createBabelConfig({stage: 3}, {stage: 1})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015'),
          require.resolve('../babel-presets/stage-1'),
        ],
      })
    })
    it('cancels default stage config', () => {
      expect(createBabelConfig({}, {stage: false})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015'),
        ],
      })
    })
    it('cancels build runtime config', () => {
      expect(createBabelConfig({runtime: true}, {runtime: false})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015'),
          require.resolve('../babel-presets/stage-2'),
        ],
      })
    })
    it('uses build and user config to configure a loose es2015 preset with native modules', () => {
      expect(createBabelConfig({native: true}, {loose: true})).toEqual({
        presets: [
          require.resolve('../babel-presets/es2015-loose-native'),
          require.resolve('../babel-presets/stage-2'),
        ],
      })
    })
  })
})
