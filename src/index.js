const express = require('express')
const app = express()
const mongoose = require('mongoose')
const route = require('./route/route')


app.use(express.json())

mongoose.connect('', {useNewUrlParser: true}, mongoose.set('strictQuery', true))
.then(() => { console.log('MongoDB is connected')})
.catch((error) => {console.log(error)})

app.use('/', route)

app.listen(3000, function(){
    console.log('Express app running on port '+ 3000)
})