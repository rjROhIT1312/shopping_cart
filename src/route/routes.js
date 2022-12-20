const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const auth = require('../middleware/auth')

//REGISTER USER
router.post('/register', userController.registerUser)

//LOGIN USER
router.post('/login', userController.login)

//GET USER PROFILE
router.get('/user/:userId/profile', auth.authentication, userController.getUserProfile)

//UPDATE USER PROFILE
router.put('/user/:userId/profile', auth.authentication, auth.authorization, userController.updateUser)

//CREATE PRODUCT
router.post('/products', productController.createProduct)

//GET PRODUCTS BY FILTER
router.get('/products', productController.getProductByFilter)

//GET PRODUCTS BY PARAMS
router.get('/products/:productId', productController.getProductByParams)

//WRONG PATH
router.all('/*', function (req, res) {
    res.status(400).send({ status: false, message: 'Path not found' })
})

module.exports = router