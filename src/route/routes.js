const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require("../controller/cartController")
const auth = require('../middleware/auth')


// ****************************==>FEATURE I - USER<==************************************

//REGISTER USER
router.post('/register', userController.registerUser)

//LOGIN USER
router.post('/login', userController.login)

//GET USER PROFILE
router.get('/user/:userId/profile', auth.authentication, userController.getUserProfile)

//UPDATE USER PROFILE
router.put('/user/:userId/profile', auth.authentication, auth.authorization, userController.updateUser)




// ****************************==>FEATTURE II - PRODUCT<==**********************************

//CREATE PRODUCT
router.post('/products', productController.createProduct)

//GET PRODUCTS BY FILTER
router.get('/products', productController.getProductByFilter)

//GET PRODUCTS BY PARAMS
router.get('/products/:productId', productController.getProductByParams)

// UPDATE PRODUCTS BY PRODUCTID
router.put("/products/:productId", productController.updateProduct)

// DELETE PRODUCT BY PRODUCTID
router.delete("/products/:productId", productController.deleteProduct)



// ****************************==>FEATURE III - Cart<==***************************************

router.post("/users/:userId/cart", cartController.createCart)

//WRONG PATH
router.all('/*', function (req, res) {
    res.status(400).send({ status: false, message: 'Path not found' })
})

module.exports = router