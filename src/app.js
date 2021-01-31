const express = require('express')

require('dotenv').config()

const api = require('./api')

const app = express()

app.get('/', (req, res) => {
  res.send('Base app page')
})

app.use('/api', api)

module.exports = app
