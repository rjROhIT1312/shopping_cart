const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const route = require('./route/routes')
const app = express()

app.use(express.json())

app.use(multer().any())

mongoose.set('strictQuery', true)

mongoose.connect('mongodb+srv://Aman_Mohadikar:V5FW1Y8X6b2pIiud@cluster0.gdww84s.mongodb.net/group30Database', { useNewUrlParser: true })
    .then(() => { console.log('MongoDB is connected') })
    .catch((error) => { console.log(error) })

app.use('/', route) 

app.listen(3000, function () {
    console.log('Express app running on port ' + 3000)
})