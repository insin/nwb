import expect from 'expect'

import createWebpackConfig, {
  combineLoaders,
  getTopLevelLoaderConfig,
  mergeLoaderConfig,
  styleLoaderName
} from '../src/createWebpackConfig'

let findLoaderById = (loaders, id) => {
  return loaders.filter(loader => loader.id === id)[0]
}

describe('createWebpackConfig()', () => {
  context('without any config arguments', () => {
    let config = createWebpackConfig({})
    it('creates a default webpack build config', () => {
      expect(Object.keys(config)).toEqual(['module', 'plugins', 'resolve'])
      expect(config.module.loaders.map(loader => loader.loader).join('\n'))
        .toContain('babel-loader')
        .toContain('extract-text-webpack-plugin')
        .toContain('css-loader')
        .toContain('autoprefixer-loader')
        .toContain('url-loader')
        .toContain('file-loader')
        .toContain('json-loader')
      expect(config.resolve.extensions).toEqual(['', '.web.js', '.js', '.jsx', '.json'])
    })
    it('excludes node_modules from babel-loader', () => {
      expect(config.module.loaders[0].exclude.test('node_modules')).toBe(true)
    })
  })

  context('with a server=true config argument', () => {
    let config = createWebpackConfig({server: true})
    it('creates a server webpack config', () => {
      expect(config.module.loaders.map(loader => loader.loader).join('\n'))
        .toContain('babel-loader')
        .toContain('style-loader')
        .toContain('css-loader')
        .toContain('autoprefixer-loader')
        .toContain('url-loader')
        .toContain('file-loader')
        .toContain('json-loader')
      expect(config.resolve.extensions).toEqual(['', '.web.js', '.js', '.jsx', '.json'])
    })
  })

  let cssPreprocessorPluginConfig = {
    cssPreprocessors: {
      sass: {
        test: /\.scss$/,
        loader: 'path/to/sass-loader.js'
      }
    }
  }

  context('with plugin config for a CSS preprocessor', () => {
    let config = createWebpackConfig({server: true}, cssPreprocessorPluginConfig)
    it('creates a style loading pipeline', () => {
      let loader = findLoaderById(config.module.loaders, 'sass-pipeline')
      expect(loader).toExist()
      expect(loader.loader).toMatch(/.*?style-loader.*?css-loader.*?autoprefixer-loader.*?!path\/to\/sass-loader\.js$/)
      expect(loader.exclude.test('node_modules')).toBe(true, 'app loader should exclude node_modules')
    })
    it('creates a vendor style loading pipeline', () => {
      let loader = findLoaderById(config.module.loaders, 'vendor-sass-pipeline')
      expect(loader).toExist()
      expect(loader.loader).toMatch(/.*?style-loader.*?css-loader.*?autoprefixer-loader.*?!path\/to\/sass-loader\.js$/)
      expect(loader.include.test('node_modules')).toBe(true, 'vendor loader should include node_modules')
    })
  })

  context('with plugin config for a CSS preprocessor and user config for its loader', () => {
    let config = createWebpackConfig({server: true}, cssPreprocessorPluginConfig, {
      loaders: {
        sass: {
          query: {
            a: 1,
            b: 2
          }
        }
      }
    })
    it('applies user config to the preprocessor loader', () => {
      let loader = findLoaderById(config.module.loaders, 'sass-pipeline')
      expect(loader).toExist()
      expect(loader.loader).toMatch(/.*?style-loader.*?css-loader.*?autoprefixer-loader.*?!path\/to\/sass-loader\.js\?a=1&b=2$/)
    })
    it('only applies user config to the appropriate loader', () => {
      let loader = findLoaderById(config.module.loaders, 'vendor-sass-pipeline')
      expect(loader).toExist()
      expect(loader.loader).toMatch(/.*?style-loader.*?css-loader.*?autoprefixer-loader.*?!path\/to\/sass-loader\.js$/)
    })
  })

  context('with extra config', () => {
    it('merges extra config into the generated webpack config', () => {
      let config = createWebpackConfig({}, {}, {extra: {
        resolve: {
          alias: {
            'test': './test'
          }
        },
        foo: 'bar'
      }})
      expect(config.resolve.alias).toEqual({
        'test': './test'
      })
      expect(config.foo).toEqual('bar')
    })
  })
})

describe('styleLoaderName()', () => {
  it('returns the given value if a falsy prefix was given', () => {
    let name = styleLoaderName(null)
    expect(name('css')).toEqual('css')
    expect(name('style')).toEqual('style')
  })
  it('prefixes the value if a prefix was given', () => {
    let name = styleLoaderName('vendor')
    expect(name('css')).toEqual('vendor-css')
    expect(name('style')).toEqual('vendor-style')
  })
  it('returns the prefix if it ends with the given value', () => {
    let name = styleLoaderName('sass')
    expect(name('css')).toEqual('sass-css')
    expect(name('sass')).toEqual('sass')
    name = styleLoaderName('vendor-sass')
    expect(name('css')).toEqual('vendor-sass-css')
    expect(name('sass')).toEqual('vendor-sass')
  })
})

describe('mergeLoaderConfig()', () => {
  const TEST_RE = /\.test$/
  const EXCLUDE_RE = /node_modules/
  let loader = {test: TEST_RE, loader: 'one', exclude: EXCLUDE_RE}
  it('merges default, build and user config for a loader', () => {
    expect(mergeLoaderConfig(
      {...loader, query: {a: 1}},
      {query: {b: 2}},
      {query: {c: 3}}
    )).toEqual({
      test: TEST_RE,
      loader: 'one',
      exclude: EXCLUDE_RE,
      query: {a: 1, b: 2, c: 3}
    })
  })
  it('only adds a query prop if the merged query has props', () => {
    expect(mergeLoaderConfig(loader, {}, {})).toEqual({
      test: TEST_RE,
      loader: 'one',
      exclude: EXCLUDE_RE
    })
  })
  it('removes the merged query when it has no properties', () => {
    expect(mergeLoaderConfig(loader, {}, {query: {}})).toEqual({
      test: TEST_RE,
      loader: 'one',
      exclude: EXCLUDE_RE
    })
  })
  it('appends lists when merging queries', () => {
    expect(mergeLoaderConfig(
      loader,
      {query: {optional: ['two']}},
      {query: {optional: ['three']}}
    )).toEqual({
      test: TEST_RE,
      loader: 'one',
      exclude: EXCLUDE_RE,
      query: {
        optional: ['two', 'three']
      }
    })
  })
  it('deep merges queries', () => {
    expect(mergeLoaderConfig(
      loader,
      {query: {nested: {a: true}}},
      {query: {nested: {b: true}}}
    )).toEqual({
      test: TEST_RE,
      loader: 'one',
      exclude: EXCLUDE_RE,
      query: {
        nested: {
          a: true,
          b: true
        }
      }
    })
  })
})

describe('combineLoaders()', () => {
  it('stringifies query strings, appends them and joins loaders', () => {
    expect(combineLoaders([
      {loader: 'one', query: {a: 1, b: 2}},
      {loader: 'two', query: {c: 3, d: 4}}
    ])).toEqual('one?a=1&b=2!two?c=3&d=4')
  })
  it('only appends a ? if query is non-empty', () => {
    expect(combineLoaders([
      {loader: 'one', query: {a: 1, b: 2}},
      {loader: 'two', query: {}},
      {loader: 'three'}
    ])).toEqual('one?a=1&b=2!two!three')
  })
})

describe('getTopLevelLoaderConfig()', () => {
  describe('without any top level config specified', () => {
    it('returns an empty object', () => {
      expect(getTopLevelLoaderConfig(null)).toEqual({})
      expect(getTopLevelLoaderConfig({})).toEqual({})
    })
  })
  it('trusts the user if they specify their own config prop for a loader', () => {
    expect(getTopLevelLoaderConfig({test: {config: {a: 1}, query: {config: 'testLoader'}}}))
      .toEqual({testLoader: {a: 1}})
  })
  it('throws if a top-level webpack config prop is used', () => {
    expect(getTopLevelLoaderConfig)
      .withArgs({test: {config: {a: 1}, query: {config: 'entry'}}})
      .toThrow(/this is reserved for use by Webpack/)
  })
  it('uses "babel" as the default config prop for babel-loader', () => {
    expect(getTopLevelLoaderConfig({babel: {config: {stage: 0}}}))
      .toEqual({babel: {stage: 0}})
  })
  it('throws if other top-level config is given', () => {
    expect(getTopLevelLoaderConfig)
      .withArgs({test: {config: {a: 1}}})
      .toThrow(/The test loader doesn't appear to support a default top-level config object/)
  })

  describe('with CSS preprocessors available', () => {
    let cssPreprocessors = {
      sass: {
        test: /\.scss$/,
        loader: 'path/to/sass-loader.js',
        defaultConfig: 'sassLoader'
      },
      less: {
        test: /\.less$/,
        loader: 'path/to/less-loader.js'
      }
    }

    it('uses the default config prop for a CSS preprocessor', () => {
      expect(getTopLevelLoaderConfig({sass: {config: {a: 1}}}, cssPreprocessors))
        .toEqual({sassLoader: {a: 1}})
    })
    it('throws if the same config prop is configured twice', () => {
      expect(getTopLevelLoaderConfig)
        .withArgs({
          sass: {config: {a: 1}},
          'vendor-sass': {config: {b: 1}}
        }, cssPreprocessors)
        .toThrow(/this has already been used/)
    })
    it('throws if a default config prop is not available', () => {
      expect(getTopLevelLoaderConfig)
        .withArgs({less: {config: {a: 1}}}, cssPreprocessors)
        .toThrow(/The less CSS preprocessor loader doesn't support a default top-level config object/)
    })
  })
})
