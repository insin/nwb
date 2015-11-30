import expect from 'expect'

import createWebpackConfig, {
  combineLoaders,
  mergeLoaderConfig
} from '../src/createWebpackConfig'

let cwd = process.cwd()

describe('createWebpackConfig()', () => {
  describe('without any config arguments', () => {
    let config = createWebpackConfig(cwd, {})
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

  describe('with a server=true config argument', () => {
    let config = createWebpackConfig(cwd, {server: true})
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
      include: undefined,
      exclude: EXCLUDE_RE,
      query: {a: 1, b: 2, c: 3}
    })
  })
  it('only adds a query prop if the merged query has props', () => {
    expect(mergeLoaderConfig(loader, {}, {})).toEqual({
      test: TEST_RE,
      loader: 'one',
      include: undefined,
      exclude: EXCLUDE_RE
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
