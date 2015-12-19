import expect from 'expect'

import getUserConfig from '../src/getUserConfig'

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

  describe('when babel config is provided', () => {
    it('creates a babel-loader config if there was none', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-only-config.js'})
      expect(config.loaders).toEqual({
        babel: {
          query: {
            loose: 'all',
            stage: 0,
            optioonal: ['runtime']
          }
        }
      })
    })
    it('adds the config to existing babel-loader config if it had no query', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-loader-config.js'})
      expect(config.loaders).toEqual({
        babel: {
          exclude: 'test',
          query: {
            loose: 'all'
          }
        }
      })
    })
    it('does nothing if existing babel-loader config already has a query', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-loader-query-config.js'})
      expect(config.loaders).toEqual({
        babel: {
          exclude: 'test',
          query: {
            loose: 'all',
            stage: 0,
            optioonal: ['runtime']
          }
        }
      })
    })
  })
})
