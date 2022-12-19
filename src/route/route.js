const express = require('express')
const router = express.Router()
const userController = require('../userController/userController')


router.post('/register',userController.register)

router.all('/*', function(req, res){
    res.status(400).send({status: false, message: 'Path not found'})
})


module.exports = router