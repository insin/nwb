import expect from 'expect'

import {createBanner, createWebpackExternals, joinAnd} from '../src/utils'

describe('utility functions', () => {
  describe('createBanner()', () => {
    it('uses name and version', () => {
      expect(createBanner({
        name: 'test',
        version: '1.0.0',
      })).toEqual('test v1.0.0')
    })
    it('uses homepage if available', () => {
      expect(createBanner({
        name: 'test',
        version: '1.0.0',
        homepage: 'foo.com',
      })).toEqual('test v1.0.0 - foo.com')
    })
    it('uses license if available', () => {
      expect(createBanner({
        name: 'test',
        version: '1.0.0',
        homepage: 'foo.com',
        license: 'MIT',
      })).toEqual('test v1.0.0 - foo.com\nMIT Licensed')
    })
  })

  describe('createWebpackExternals()', () => {
    it('returns an empty object by default', () => {
      expect(createWebpackExternals()).toEqual({})
    })
    it('uses the webpack externals format', () => {
      expect(createWebpackExternals({react: 'React'})).toEqual({
        react: {
          amd: 'react',
          commonjs: 'react',
          commonjs2: 'react',
          root: 'React',
        }
      })
    })
  })

  describe('joinAnd()', () => {
    it('returns the first item for single-item lists', () => {
      expect(joinAnd(['one'])).toEqual('one')
    })
    it('joins two items with "and"', () => {
      expect(joinAnd(['one', 'two'])).toEqual('one and two')
    })
    it('joins multiple items with a penultipate "and"', () => {
      expect(joinAnd(['one', 'two', 'three'])).toEqual('one, two and three')
    })
  })
})
