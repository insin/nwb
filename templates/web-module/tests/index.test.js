import expect from 'expect'

import message from 'src/index'

describe('Module template', () => {
  it('displays a welcome message', () => {
    expect(message).toContain('Welcome to {{name}}')
  })
})
