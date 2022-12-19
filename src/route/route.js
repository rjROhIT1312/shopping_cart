const express = require('express')
const router = express.Router()





router.all('/*', function(req, res){
    res.status(400).send({status: false, message: 'Path not found'})
})


module.exports = router