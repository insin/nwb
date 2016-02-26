import expect from 'expect'
import webpack from 'webpack'

import getUserConfig from '../src/getUserConfig'

describe('getUserConfig()', () => {
  describe("when a required config file can't be found", () => {
    it('throws an error', () => {
      expect(getUserConfig)
        .withArgs({config: 'tests/fixtures/nonexistent.js'}, {required: true})
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

  describe("when a non-required config file can't be found", () => {
    it('returns default config', () => {
      let config = getUserConfig({config: 'tests/fixtures/nonexistent.js'})
      expect(config).toEqual({
        build: {
          externals: {},
          global: '',
          jsNext: false,
          umd: false
        },
        webpack: {
          loaders: {},
          plugins: {}
        }
      })
    })
  })

  describe('when a config function is provided', () => {
    it('gets passed command and webpack arguments', () => {
      let config = getUserConfig({
        _: ['abc123'],
        config: 'tests/fixtures/return-arguments-config.js'
      })
      expect(config.command).toEqual('abc123')
      expect(config.webpack).toEqual(webpack)
    })
  })

  describe('build config', () => {
    context('when none is provided', () => {
      it('gets defaulted', () => {
        let config = getUserConfig({config: 'tests/fixtures/minimal-module-config.js'})
        expect(config.build).toEqual({
          externals: {},
          global: '',
          jsNext: false,
          umd: false
        })
      })
    })
    context('when partial config is provided', () => {
      it('missing config is defaulted', () => {
        let config = getUserConfig({config: 'tests/fixtures/partial-build-config.js'})
        expect(config.build).toEqual({
          externals: {},
          global: 'Test',
          jsNext: false,
          umd: true
        })
      })
    })
  })

  describe('webpack config', () => {
    context('when none is provided', () => {
      it('gets defaulted', () => {
        let config = getUserConfig({config: 'tests/fixtures/minimal-module-config.js'})
        expect(config.webpack).toEqual({
          loaders: {},
          plugins: {}
        })
      })
    })
  })

  describe('when babel config is provided', () => {
    it('creates a babel-loader config if there was none', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-only-config.js'})
      expect(config.webpack.loaders).toEqual({
        babel: {
          query: {
            loose: 'all',
            stage: 0,
            optional: ['runtime']
          }
        }
      })
    })
    it('adds the config to existing babel-loader config if it had no query', () => {
      let config = getUserConfig({config: 'tests/fixtures/babel-loader-config.js'})
      expect(config.webpack.loaders).toEqual({
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
      expect(config.webpack.loaders).toEqual({
        babel: {
          exclude: 'test',
          query: {
            loose: 'all',
            stage: 0,
            optional: ['runtime']
          }
        }
      })
    })
  })
})
