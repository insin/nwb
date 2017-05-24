import React, {Component} from 'react'

// Async function to test that babel-runtime is available
async function fetchStories(subreddit) { // eslint-disable-line no-unused-vars
  var req = await window.fetch(`https://www.reddit.com/r/${subreddit}.json`, {mode: 'cors'})
  var json = await req.json()
  return json
}

export default class extends Component {
  render() {
    return <div>
      <h2>Welcome to React</h2>
    </div>
  }
}
