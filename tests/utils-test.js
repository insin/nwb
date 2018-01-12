// @flow
import expect from 'expect'

import {joinAnd, padLines} from '../src/utils'
import {createBanner, createExternals} from '../src/webpackUtils'

describe('utils', () => {
  describe('joinAnd()', () => {
    it('returns an empty string for empty lists', () => {
      expect(joinAnd([])).toEqual('')
    })
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

  describe('padLines()', () => {
    it('pads lines with 2 spaces by default', () => {
      expect(padLines('1\n2\n3\n4')).toEqual('  1\n  2\n  3\n  4')
    })
  })
})

describe('webpackUtils', () => {
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

  describe('createExternals()', () => {
    it('returns an empty object by default', () => {
      expect(createExternals()).toEqual({})
    })
    it('uses the webpack externals format', () => {
      expect(createExternals({react: 'React'})).toEqual({
        react: {
          amd: 'react',
          commonjs: 'react',
          commonjs2: 'react',
          root: 'React',
        }
      })
    })
  })
})
