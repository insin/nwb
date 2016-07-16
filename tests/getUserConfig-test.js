import expect from 'expect'
import webpack from 'webpack'

import getUserConfig, {prepareWebpackLoaderConfig, processUserConfig} from '../src/getUserConfig'

describe('getUserConfig()', () => {
  it("throws an error when a required config file can't be found", () => {
    expect(() => getUserConfig({config: 'tests/fixtures/nonexistent.js'}, {required: true}))
      .toThrow(/couldn't find a config file/)
  })

  it('throws an error when the config file is invalid or otherwise causes an error', () => {
    expect(() => getUserConfig({config: 'tests/fixtures/invalid-config.js'}))
      .toThrow(/couldn't import the config file/)
  })

  it("returns default config when a non-required config file can't be found", () => {
    let config = getUserConfig()
    expect(config).toEqual({
      babel: {},
      build: {
        externals: {},
        global: '',
        jsNext: false,
        umd: false,
      },
      webpack: {},
    })
  })
})

describe('processUserConfig()', () => {
  context('validation', () => {
    it('throws an error if the config file has an invalid type', () => {
      expect(() => processUserConfig({
        userConfig: {
          type: 'invalid'
        }
      })).toThrow(/invalid type config/)
    })
    it('throws an error if babel.stage is not a number or falsy', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {stage: []}
        }
      })).toThrow(/must be a number, or falsy/)
    })
    it('throws an error if babel.stage is less than 0', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {stage: -1}
        }
      })).toThrow(/must be between 0 and 3/)
    })
    it('throws an error if babel.stage is greater than 3', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {stage: 4}
        }
      })).toThrow(/must be between 0 and 3/)
    })
    it('throws an error if babel.presets is not an array', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {presets: 'some-preset'}
        }
      })).toThrow(/must be an array/)
    })
    it('throws an error if babel.plugins is not an array', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {plugins: 'some-plugin'}
        }
      })).toThrow(/must be an array/)
    })
    it('throws an error if babel.runtime is not valid', () => {
      expect(() => processUserConfig({
        userConfig: {
          babel: {runtime: 'welp'}
        }
      })).toThrow(/must be boolean or one of: 'helpers', 'regenerator', 'polyfill'/)
    })
  })

  it('passes command and webpack arguments when a config function is provided', () => {
    let config = processUserConfig({
      args: {_: ['abc123']},
      userConfig(args) {
        return {
          command: args.command,
          webpack: args.webpack,
        }
      }
    })
    expect(config.command).toEqual('abc123')
    expect(config.webpack).toEqual(webpack)
  })

  it('defaults top-level config when none is provided', () => {
    let config = processUserConfig({
      userConfig: {
        type: 'web-module',
      },
    })
    expect(config).toEqual({
      type: 'web-module',
      babel: {},
      build: {
        externals: {},
        global: '',
        jsNext: false,
        umd: false
      },
      webpack: {},
    })
  })

  it('defaults missing build config when partial config is provided', () => {
    let config = processUserConfig({
      userConfig: {
        type: 'web-module',
        build: {
          umd: true,
          global: 'Test',
        },
      },
    })
    expect(config.build).toEqual({
      externals: {},
      global: 'Test',
      jsNext: false,
      umd: true,
    })
  })

  // TODO Remove in a future release
  it('moves plugins to webpack for 0.11 back-compat', () => {
    let config = processUserConfig({
      userConfig: {
        webpack: {
          plugins: {
            define: {
              __TEST__: 42,
            },
            html: {
              template: 'test.html',
            },
          }
        }
      }
    })
    expect(config.webpack).toEqual({
      define: {
        __TEST__: 42,
      },
      html: {
        template: 'test.html',
      },
    })
  })

  // TODO Remove in a future release
  it('converts babel.loose to boolean for 0.12 back-compat', () => {
    let config = processUserConfig({
      userConfig: {
        babel: {
          loose: 'all',
        }
      }
    })
    expect(config.babel).toEqual({loose: true})
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
          a: 42,
        },
        other: true,
      },
    }
    prepareWebpackLoaderConfig(config)
    expect(config.css).toEqual({
      test: /test/,
      include: /include/,
      exclude: /exclude/,
      config: {a: 42},
      query: {
        a: 42,
      },
      other: true,
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
        localIdentName: 'asdf',
      },
    }
    prepareWebpackLoaderConfig(config)
    expect(config.css).toEqual({
      test: /test/,
      include: /include/,
      exclude: /exclude/,
      config: {a: 42},
      query: {
        modules: true,
        localIdentName: 'asdf',
      },
    })
  })
})
