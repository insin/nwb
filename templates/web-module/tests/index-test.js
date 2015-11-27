import expect from 'expect'

import message from 'src/index'

describe('Module template', () => {
  it('displays a welcome message', () => {
    expect(message).toEqual('Hello world')
  })
})
