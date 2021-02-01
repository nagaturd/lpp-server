import express from 'express'
import summoner from './summoner'

const router = express.Router()

router.get('/', (req, res) => {
  res.send('base api page')
})

router.use('/summoner', summoner)

export default router
