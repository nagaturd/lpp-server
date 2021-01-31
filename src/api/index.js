const express = require('express')

const summoner = require('./summoner')

const router = express.Router()

router.get('/', (req, res) => {
  res.send('base api page')
})

router.use('/summoner', summoner)

module.exports = router
