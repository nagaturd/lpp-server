import express from 'express'
import dotenv from 'dotenv'
import api from './api'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
  res.send('Base app page')
})

app.use('/api', api)

export default app
