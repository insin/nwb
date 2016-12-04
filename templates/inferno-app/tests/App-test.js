import expect from 'expect'
import Inferno from 'inferno'

import App from 'src/App'

describe('App component', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    Inferno.render(null, node)
  })

  it('displays a welcome message', () => {
    Inferno.render(<App/>, node)
    expect(node.textContent).toContain('Welcome to Inferno')
  })
})
