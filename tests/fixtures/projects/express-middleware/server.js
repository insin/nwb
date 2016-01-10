var express = require('express')

var app = express()

app.use(require(process.env.NWB_EXPRESS_MIDDLEWARE)(express))

app.listen(3001, 'localhost', function(err) {
  if (err) {
    console.error('error starting express-middleware test server')
  }
  console.log('express-middleware test server listening at http://localhost:3001')
})
