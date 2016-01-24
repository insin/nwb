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

describe('getKarmaConfig()', function() {
  this.timeout(10000)
  describe('without user config', () => {
    let expectedDefaultPlugins = [
      'launcher:PhantomJS',
      'preprocessor:sourcemap',
      'webpackPlugin',
      'framework:mocha',
      'reporter:mocha'
    ]
    it('defaults to Mocha', () => {
      let {frameworks, reporters, plugins, extraLoaders} = getKarmaConfig({codeCoverage: false})
      expect(frameworks).toEqual(['mocha'])
      expect(reporters).toEqual(['mocha'])
      expect(extraLoaders).toEqual([])
      expectedDefaultPlugins.forEach(plugin =>
        expect(findPlugin(plugins, plugin)).toExist()
      )
    })
    it('adds coverage config when asked to', () => {
      let {frameworks, reporters, plugins, extraLoaders} = getKarmaConfig({codeCoverage: true})
      expect(frameworks).toEqual(['mocha'])
      expect(reporters).toEqual(['mocha', 'coverage'])
      expectedDefaultPlugins.concat(['preprocessor:coverage']).forEach(plugin => {
        expect(findPlugin(plugins, plugin)).toExist()
      })
      expect(extraLoaders.length).toEqual(1)
      expect(extraLoaders[0].loader).toInclude('isparta-loader')
    })
  })

  describe('with user config', () => {
    let tapeFramework = {'framework:tape': []}
    let tapReporter = {'reporter:tap': []}

    it('defaults the reporter to dots if only a framework plugin is configured', () => {
      let {frameworks, reporters, plugins} = getKarmaConfig({codeCoverage: false}, {
        karma: {
          frameworks: [tapeFramework]
        }
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['dots'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
    })
    it('defaults the reporter to dots if only a framework name and plugin is configured', () => {
      let {frameworks, reporters, plugins} = getKarmaConfig({codeCoverage: false}, {
        karma: {
          frameworks: ['tape'],
          plugins: [tapeFramework]
        }
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['dots'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
    })
    it('uses the given reporter if a plugin is also configured', () => {
      let {frameworks, reporters, plugins} = getKarmaConfig({codeCoverage: false}, {
        karma: {
          frameworks: [tapeFramework],
          reporters: [tapReporter]
        }
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['tap'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
      expect(findPlugin(plugins, 'reporter:tap')).toExist()
    })
    it('uses the given reporter if a name plugin is also configured', () => {
      let {frameworks, reporters, plugins} = getKarmaConfig({codeCoverage: false}, {
        karma: {
          frameworks: ['tape'],
          reporters: ['tap'],
          plugins: [tapeFramework, tapReporter]
        }
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['tap'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
      expect(findPlugin(plugins, 'reporter:tap')).toExist()
    })
    it('makes sure the Mocha plugins will be loaded when necessary', () => {
      let {frameworks, reporters, plugins} = getKarmaConfig({codeCoverage: false}, {
        karma: {
          frameworks: ['mocha', 'chai', 'chai-as-promised'],
          reporters: ['mocha'],
          plugins: [{'framework: chai': []}]
        }
      })
      expect(frameworks).toEqual(['mocha', 'chai', 'chai-as-promised'])
      expect(reporters).toEqual(['mocha'])
      expect(findPlugin(plugins, 'framework:mocha')).toExist()
      expect(findPlugin(plugins, 'reporter:mocha')).toExist()
      expect(findPlugin(plugins, 'framework: chai')).toExist()
    })
  })
})
