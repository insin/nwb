import expect from 'expect'

describe('App template', () => {
  let app

  before(() => {
    app = document.createElement('div')
    app.id = 'app'
    document.body.appendChild(app)
  })

  after(() => {
    document.body.removeChild(app)
  })

  it('displays a welcome message', () => {
    require('src/index')
    expect(app.innerHTML).toContain('Welcome to {{name}}')
  })
})
