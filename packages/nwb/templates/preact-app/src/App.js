import './App.css'

import {h, Component} from 'preact'

export default class App extends Component {
  render() {
    return <div className="App">
      <div className="App-heading App-flex">
        <h2>
          Welcome to <img alt="Preact" src={require('./preact-name.svg')} style="height: 1.8em; vertical-align: middle;"/>
        </h2>
      </div>
      <div className="App-instructions App-flex">
        <img className="App-logo" src={require('./preact-logo.svg')}/>
        <p>Edit <code>src/App.js</code> and save to hot reload your changes.</p>
      </div>
    </div>
  }
}
