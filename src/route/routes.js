const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const awsController = require('../controller/awsController')


router.post('/register',userController.registerUser)

router.post('/login', userController.login)

router.get('/user/:userId/profile', userController.getUserProfile)

router.all('/*', function(req, res){
    res.status(400).send({status: false, message: 'Path not found'})
})

module.exports = router