const express = require('express')
const { restart } = require('nodemon')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.json())
app.use(cors())

const userPort = require('./routes/User')
const questionPort = require('./routes/Questions')
const commentPort = require('./routes/Comments')
app.use('/users', userPort)
app.use('/question', questionPort)
app.use('/comment',commentPort)

mongoose.connect(process.env.DB_CONNECTOR)
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection error', err))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`IT troubleshooting is live on ${PORT}`)
})
