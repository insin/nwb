import expect from 'expect'

import getUserConfig from '../src/getUserConfig'

describe('getUserConfig()', () => {
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
