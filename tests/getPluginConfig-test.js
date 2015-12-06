import path from 'path'

import expect from 'expect'

import getPluginConfig from '../src/getPluginConfig'

describe('getPluginConfig()', () => {
  it('scans package.json for nwb-* dependencies and imports them', () => {
    let config = getPluginConfig(path.join(__dirname, 'fixtures/plugins'))
    expect(config).toEqual({
      cssPreprocessors: {
        fake: {
          loader: 'path/to/fake.js',
          test: /\.fake$/
        }
      }
    })
  })
})
