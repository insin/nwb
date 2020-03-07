import expect from 'expect'

import createKarmaConfig, {
  findPlugin,
  getKarmaPluginConfig,
  processPluginConfig,
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

describe('getKarmaPluginConfig()', function() {
  this.timeout(10000)
  describe('without user config', () => {
    let expectedDefaultPlugins = [
      'launcher:PhantomJS',
      'preprocessor:sourcemap',
      'webpackPlugin',
      'framework:mocha',
      'reporter:mocha',
    ]
    it('defaults to Mocha and PhantomJS', () => {
      let {browsers, frameworks, reporters, plugins} = getKarmaPluginConfig()
      expect(browsers).toEqual(['PhantomJS'])
      expect(frameworks).toEqual(['mocha'])
      expect(reporters).toEqual(['mocha'])
      expectedDefaultPlugins.forEach(plugin =>
        expect(findPlugin(plugins, plugin)).toExist()
      )
    })
    it('adds coverage config when asked to', () => {
      let {browsers, frameworks, reporters, plugins} = getKarmaPluginConfig({codeCoverage: true})
      expect(browsers).toEqual(['PhantomJS'])
      expect(frameworks).toEqual(['mocha'])
      expect(reporters).toEqual(['mocha', 'coverage'])
      expectedDefaultPlugins.concat(['preprocessor:coverage']).forEach(plugin => {
        expect(findPlugin(plugins, plugin)).toExist()
      })
    })
  })

  describe('with user config', () => {
    let tapeFramework = {'framework:tape': []}
    let tapReporter = {'reporter:tap': []}

    it('defaults the reporter to dots if only a framework plugin is configured', () => {
      let {frameworks, reporters, plugins} = getKarmaPluginConfig({
        userConfig: {
          frameworks: [tapeFramework],
        },
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['dots'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
    })
    it('defaults the reporter to dots if only a framework name and plugin is configured', () => {
      let {frameworks, reporters, plugins} = getKarmaPluginConfig({
        userConfig: {
          frameworks: ['tape'],
          plugins: [tapeFramework],
        },
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['dots'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
    })
    it('uses the given reporter if a plugin is also configured', () => {
      let {frameworks, reporters, plugins} = getKarmaPluginConfig({
        userConfig: {
          frameworks: [tapeFramework],
          reporters: [tapReporter],
        },
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['tap'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
      expect(findPlugin(plugins, 'reporter:tap')).toExist()
    })
    it('uses the given reporter if a name plugin is also configured', () => {
      let {frameworks, reporters, plugins} = getKarmaPluginConfig({
        userConfig: {
          frameworks: ['tape'],
          reporters: ['tap'],
          plugins: [tapeFramework, tapReporter],
        },
      })
      expect(frameworks).toEqual(['tape'])
      expect(reporters).toEqual(['tap'])
      expect(findPlugin(plugins, 'framework:tape')).toExist()
      expect(findPlugin(plugins, 'reporter:tap')).toExist()
    })
    it('makes sure the Mocha plugins will be loaded when necessary', () => {
      let {frameworks, reporters, plugins} = getKarmaPluginConfig({
        userConfig: {
          frameworks: ['mocha', 'chai', 'chai-as-promised'],
          reporters: ['mocha'],
          plugins: [{'framework: chai': []}],
        },
      })
      expect(frameworks).toEqual(['mocha', 'chai', 'chai-as-promised'])
      expect(reporters).toEqual(['mocha'])
      expect(findPlugin(plugins, 'framework:mocha')).toExist()
      expect(findPlugin(plugins, 'reporter:mocha')).toExist()
      expect(findPlugin(plugins, 'framework: chai')).toExist()
    })
    it('makes sure the Chrome launcher plugin will be loaded when necessary', () => {
      let {browsers, plugins} = getKarmaPluginConfig({
        userConfig: {
          browsers: ['Chrome']
        },
      })
      expect(browsers).toEqual(['Chrome'])
      expect(findPlugin(plugins, 'launcher:Chrome')).toExist()
    })
  })
})

describe('createKarmaConfig()', () => {
  it('includes polyfill and default test files pattern', () => {
    let config = createKarmaConfig({}, {}, {}, {})
    expect(config.files).toEqual([
      require.resolve('@babel/polyfill/dist/polyfill.js'),
      '+(src|test?(s))/**/*+(.spec|.test).js',
    ])
  })
  it('includes default mocha reporter config', () => {
    let config = createKarmaConfig({}, {}, {}, {})
    expect(config.mochaReporter).toEqual({showDiff: true})
  })
  it('merges any extra config given into the generated config', () => {
    let config = createKarmaConfig({}, {}, {}, {
      karma: {
        extra: {
          browsers: ['Chrome'],
          mochaReporter: {
            output: 'autowatch',
          },
        }
      }
    })
    expect(config.browsers).toEqual(['PhantomJS', 'Chrome'])
    expect(config.mochaReporter).toEqual({output: 'autowatch', showDiff: true})
  })
  it('supports a karma.config() function to manually edit generated config', () => {
    let config = createKarmaConfig({}, {}, {}, {
      karma: {
        config(karmaConfig) {
          karmaConfig.browsers.push('Chrome')
          return karmaConfig
        }
      }
    })
    expect(config.browsers).toEqual(['PhantomJS', 'Chrome'])
  })
})
