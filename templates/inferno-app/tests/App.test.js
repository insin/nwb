import expect from 'expect'
import {render} from 'inferno'

import App from 'src/App'

describe('App component', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    render(null, node)
  })

  it('displays a welcome message', () => {
    render(<App/>, node)
    expect(node.textContent).toContain('Welcome to Inferno')
  })
})
