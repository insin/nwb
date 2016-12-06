import './App.css'

import Inferno from 'inferno'
import Component from 'inferno-component'

class App extends Component {
  render() {
    return <div className="App">
      <div className="App-heading App-flex">
        <h2>Welcome to <span className="App-inferno">Inferno</span></h2>
      </div>
      <div className="App-instructions App-flex">
        <img className="App-logo" src={require('./inferno.svg')}/>
        <p>Edit <code>src/App.js</code> and save to hot reload your changes.</p>
      </div>
    </div>
  }
}

export default App
