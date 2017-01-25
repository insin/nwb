## Middleware

nwb provides middleware for serving a hot reloading app from your own server.

This gives you the same setup as if you'd run the `nwb serve` command, using your app's `nwb.config.js` file for configuration as usual.

### Express 4.x Middleware

Middleware for Express 4.x for developing apps can be imported from `'nwb/express'`.

See the [nwb-react-tutorial](https://github.com/insin/nwb-react-tutorial) project for an example of using it.

#### API

##### `middleware(express, options: Object)`

###### `express`

Your app's version of the Express module must be passed as the first argument.

###### `options`

- `config` - path to a config file *[default: nwb.config.js]*
- `entry` - entry point for the app *[default: src/index.js]*
- `install` - automatically install missing npm dependencies *[default: `false`]*
- `reload` - reload the page if Hot Module Replacement is unsuccessful *[default: `false`]*

#### Example

Here's a minimal express server which serves up an app:

```js
var express = require('express')

var app = express()

app.use(require('nwb/express')(express))

app.use(express.static('public'))

app.listen(3000, function(err) {
  if (err) {
    console.error('error starting server:')
    console.error(err.stack)
    process.exit(1)
  }
  console.log('server listening at http://localhost:3000')
})
```
