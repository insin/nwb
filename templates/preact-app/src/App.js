import './App.css'

import {h, Component} from 'preact'

export default class App extends Component {
  render() {
    return <div className="App">
      <div className="App-heading App-flex">
        <h2>Welcome to <span className="App-preact">Preact</span></h2>
      </div>
      <div className="App-instructions App-flex">
        <img className="App-logo" src={require('./preact.svg')}/>
        <p>Edit <code>src/App.js</code> and save to hot reload your changes.</p>
      </div>
    </div>
  }
}
