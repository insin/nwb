import expect from 'expect'

import getUserConfig from '../src/getUserConfig'
import {findNodeModules} from '../src/utils'

describe('getUserConfig()', () => {
  describe('when no config file can be found', () => {
    it('throws an error', () => {
      expect(getUserConfig)
        .withArgs({config: 'tests/fixtures/nonexistent.js'})
        .toThrow(/couldn't find a config file/)
    })
  })

  describe('when the config file is invalid or otherwise causes an error', () => {
    it('throws an error', () => {
      expect(getUserConfig)
        .withArgs({config: 'tests/fixtures/invalid-config.js'})
        .toThrow(/couldn't import the config file/)
    })
  })

  describe('when the config file has an invalid type', () => {
    it('throws an error', () => {
      expect(getUserConfig)
        .withArgs({config: 'tests/fixtures/invalid-type-config.js'})
        .toThrow(/invalid project type configured/)
    })
  })

  // TODO Remove in 0.7
  describe('when jsNext config is missing', () => {
    it('defaults to true (in nwb 0.6)', () => {
      let config = getUserConfig({config: 'tests/fixtures/minimal-module-config.js'})
      expect(config.jsNext).toBe(true)
    })
  })

  describe('when babel config is provided', () => {
    it('creates a babel-loader config if there was none', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-only-config.js'})
      let nodeModules = findNodeModules()
      expect(config.loaders).toEqual({
        babel: {
          query: {
            plugins: [
              'transform-runtime'
            ],
            presets: [
              `es2015-loose`,
              `${nodeModules}/babel-preset-es2015/index.js`,
              `${nodeModules}/babel-preset-react/index.js`,
              `${nodeModules}/babel-preset-stage-0/index.js`
            ]
          }
        }
      })
    })
    it('adds the config to existing babel-loader config if it had no query', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-loader-config.js'})
      let nodeModules = findNodeModules()
      expect(config.loaders).toEqual({
        babel: {
          ignore: 'test',
          query: {
            presets: [
              `es2015-loose`,
              `${nodeModules}/babel-preset-es2015/index.js`,
              `${nodeModules}/babel-preset-react/index.js`,
              `${nodeModules}/babel-preset-stage-2/index.js`
            ]
          }
        }
      })
    })
    it('does nothing if existing babel-loader config already has a query', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-loader-query-config.js'})
      let nodeModules = findNodeModules()
      expect(config.loaders).toEqual({
        babel: {
          ignore: 'test',
          query: {
            plugins: [
              'transform-runtime'
            ],
            presets: [
              `es2015-loose`,
              `${nodeModules}/babel-preset-es2015/index.js`,
              `${nodeModules}/babel-preset-react/index.js`,
              `${nodeModules}/babel-preset-stage-1/index.js`
            ]
          }
        }
      })
    })
  })
})
