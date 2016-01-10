## Middleware

nwb provides middleware for serving a hot reloading React app from your own server.

This gives you the same setup as if you'd run the `nwb serve` command, using your React app's `nwb.config.js` file for configuration as usual.

### Express 4.x Middleware

Middleware for Express 4.x can be imported from `'nwb/express'`.

#### API

##### `middleware(express, options: Object)`

###### `express`

Your app's version of the Express module must be passed as the first argument.

###### `options`

* `autoInstall` - automatically install missing npm dependencies. Default: `false`
* `info` - print info about Webpack modules after rebuilds. Default: `false`

#### Example

Here's a minimal express server which serves up a React app:

```js
var express = require('express')

var app = express()

app.use(require('nwb/express')(express, {
  info: true
}))

app.use(express.static('public'))

app.listen(3000, 'localhost', function(err) {
  if (err) {
    console.error('error starting server:')
    console.error(err.stack)
    process.exit(1)
  }
  console.log('server listening at http://localhost:3000')
})
```
