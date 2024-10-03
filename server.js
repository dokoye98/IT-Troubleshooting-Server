const express = require('express')
const {restart} = require('nodemon')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv/config')
app.use(bodyParser.json())
app.use(cors())
const PORT = process.env.PORT
const userPort = require('./routes/User')
const questionPort = require('./routes/Questions')
app.use('/users',userPort)
app.use('/question',questionPort)
mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log('DB connected')
})


app.listen(PORT,()=>{
    console.log(`IT troubleshooting is live on ${PORT}`)
})