import expect from 'expect'
import webpack from 'webpack'

import getUserConfig, {prepareWebpackLoaderConfig} from '../src/getUserConfig'

describe('getUserConfig()', () => {
  it("throws an error when a required config file can't be found", () => {
    expect(() => getUserConfig({config: 'tests/fixtures/nonexistent.js'}, {required: true}))
      .toThrow(/couldn't find a config file/)
  })

  it('throws an error when the config file is invalid or otherwise causes an error', () => {
    expect(() => getUserConfig({config: 'tests/fixtures/invalid-config.js'}))
      .toThrow(/couldn't import the config file/)
  })

  it('throws an error when the config file has an invalid type', () => {
    expect(() => getUserConfig({config: 'tests/fixtures/invalid-type-config.js'}))
      .toThrow(/invalid project type configured/)
  })

  it("returns default config when a non-required config file can't be found", () => {
    let config = getUserConfig({config: 'tests/fixtures/nonexistent.js'})
    expect(config).toEqual({
      build: {
        externals: {},
        global: '',
        jsNext: false,
        umd: false
      },
      webpack: {
        loaders: {}
      }
    })
  })

  it('gets passed command and webpack arguments when a config function is provided', () => {
    let config = getUserConfig({
      _: ['abc123'],
      config: 'tests/fixtures/return-arguments-config.js'
    })
    expect(config.command).toEqual('abc123')
    expect(config.webpack).toEqual(webpack)
  })

  it('defaults config when none is provided', () => {
    let config = getUserConfig({config: 'tests/fixtures/minimal-module-config.js'})
    expect(config).toEqual({
      type: 'web-module',
      build: {
        externals: {},
        global: '',
        jsNext: false,
        umd: false
      },
      webpack: {
        loaders: {}
      }
    })
  })

  it('defaults missing config when partial config is provided', () => {
    let config = getUserConfig({config: 'tests/fixtures/partial-build-config.js'})
    expect(config.build).toEqual({
      externals: {},
      global: 'Test',
      jsNext: false,
      umd: true
    })
  })

  context('when babel config is provided', () => {
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

  it('moves plugins to webpack for 0.11 back-compat', () => {
    let config = getUserConfig({config: 'tests/fixtures/0.11-webpack-plugins.js'})
    expect(config.webpack).toEqual({
      loaders: {},
      define: {
        __TEST__: 42
      },
      html: {
        template: 'test.html'
      }
    })
  })
})

describe('prepareWebpackLoaderConfig()', () => {
  it('does nothing if query is already present', () => {
    let config = {
      css: {
        test: /test/,
        include: /include/,
        exclude: /exclude/,
        config: {a: 42},
        query: {
          a: 42
        },
        other: true
      }
    }
    prepareWebpackLoaderConfig(config)
    expect(config.css).toEqual({
      test: /test/,
      include: /include/,
      exclude: /exclude/,
      config: {a: 42},
      query: {
        a: 42
      },
      other: true
    })
  })
  it('moves non-loader props into a query object', () => {
    let config = {
      css: {
        test: /test/,
        include: /include/,
        exclude: /exclude/,
        config: {a: 42},
        modules: true,
        localIdentName: 'asdf'
      }
    }
    prepareWebpackLoaderConfig(config)
    expect(config.css).toEqual({
      test: /test/,
      include: /include/,
      exclude: /exclude/,
      config: {a: 42},
      query: {
        modules: true,
        localIdentName: 'asdf'
      }
    })
  })
})
