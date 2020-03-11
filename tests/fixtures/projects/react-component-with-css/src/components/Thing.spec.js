import expect from 'expect'
import React from 'react'
import {render} from 'react-dom'

import Thing from './Thing'

describe('Thing', () => {
  it('displays a Thing', () => {
    let node = document.createElement('div')
    render(<Thing/>, node, () => {
      expect(node.innerHTML).toContain('<div class="Thing">')
    })
  })
})
