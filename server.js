const express = require('express')
const {restart} = require('nodemon')
const app = express()
const mongoose = require('mongoose')
require('dotenv/config')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const PORT = process.env.PORT

mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log('DB connected')
})


app.listen(PORT,()=>{
    console.log(`IT troubleshooting is live on ${PORT}`)
})