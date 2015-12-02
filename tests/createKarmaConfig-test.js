import expect from 'expect'

import {
  processPluginConfig,
  findPlugin,
  getKarmaConfig
} from '../src/createKarmaConfig'

let plugin = {'framework:test': []}

describe('processPluginConfig()', () => {
  it('returns strings as names', () => {
    expect(processPluginConfig(['test'])).toEqual([['test'], []])
  })
  it('extracts names from plugin objects', () => {
    let plugin = {'framework:test': []}
    expect(processPluginConfig([plugin])).toEqual([['test'], [plugin]])
  })
})

describe('findPlugin()', () => {
  let plugins = ['foo', plugin, 'bar']
  it('finds a plugin by type:name identifier', () => {
    expect(findPlugin(plugins, 'framework:test')).toBe(plugin)
  })
  it('returns null if no matching identifier is found', () => {
    expect(findPlugin(plugins, 'framework:best')).toBe(null)
  })
})

describe('getKarmaConfig()', () => {
  describe('without user config', () => {
    it('defaults to Mocha', () => {
      expect(getKarmaConfig('test', false)).toEqual({
        frameworks: ['mocha'],
        reporters: ['mocha'],
        plugins: [
          'karma-phantomjs-launcher',
          'karma-sourcemap-loader',
          'karma-webpack',
          'karma-mocha',
          'karma-mocha-reporter'
        ],
        loaders: []
      })
    })
    it('adds coverage config when asked to', () => {
      let {frameworks, reporters, plugins, loaders} = getKarmaConfig('test', true)
      expect({frameworks, reporters, plugins}).toEqual({
        frameworks: ['mocha'],
        reporters: ['mocha', 'coverage'],
        plugins: [
          'karma-phantomjs-launcher',
          'karma-sourcemap-loader',
          'karma-webpack',
          'karma-mocha',
          'karma-mocha-reporter',
          'karma-coverage'
        ]
      })
      expect(loaders.length).toEqual(1)
      expect(loaders[0].loader).toInclude('isparta-loader')
    })
  })
  describe('with user config', () => {
    let tape = {'framework:tape': []}
    let reporter = {'reporter:tap': []}
    let frameworkOnlyResult = {
      frameworks: ['tape'],
      reporters: ['dots'],
      plugins: [
        'karma-phantomjs-launcher',
        'karma-sourcemap-loader',
        'karma-webpack',
        tape
      ],
      loaders: []
    }
    let frameworkReporterResult = {
      frameworks: ['tape'],
      reporters: ['tap'],
      plugins: [
        'karma-phantomjs-launcher',
        'karma-sourcemap-loader',
        'karma-webpack',
        tape,
        reporter
      ],
      loaders: []
    }
    it('defaults the reporter to dots if only a framework plugin is configured', () => {
      expect(getKarmaConfig('test', false, {
        karma: {
          frameworks: [tape]
        }
      })).toEqual(frameworkOnlyResult)
    })
    it('defaults the reporter to dots if only a framework name and plugin is configured', () => {
      expect(getKarmaConfig('test', false, {
        karma: {
          frameworks: ['tape'],
          plugins: [tape]
        }
      })).toEqual(frameworkOnlyResult)
    })
    it('uses the given reporter if a plugin is also configured', () => {
      expect(getKarmaConfig('test', false, {
        karma: {
          frameworks: [tape],
          reporters: [reporter]
        }
      })).toEqual(frameworkReporterResult)
    })
    it('uses the given reporter if a name plugin is also configured', () => {
      expect(getKarmaConfig('test', false, {
        karma: {
          frameworks: ['tape'],
          reporters: ['tap'],
          plugins: [tape, reporter]
        }
      })).toEqual(frameworkReporterResult)
    })
    it('makes sure the Mocha plugins will be loaded when necessary', () => {
      expect(getKarmaConfig('test', false, {
        karma: {
          frameworks: ['mocha', 'chai', 'chai-as-promised'],
          reporters: ['mocha'],
          plugins: [{'framework: chai': []}]
        }
      })).toEqual({
        frameworks: ['mocha', 'chai', 'chai-as-promised'],
        reporters: ['mocha'],
        plugins: [
          'karma-phantomjs-launcher',
          'karma-sourcemap-loader',
          'karma-webpack',
          {'framework: chai': []},
          'karma-mocha',
          'karma-mocha-reporter'
        ],
        loaders: []
      })
    })
  })
})
