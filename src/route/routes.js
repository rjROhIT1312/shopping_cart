const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
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

//UPDATE PRODUCTS BY PRODUCTID
router.put("/products/:productId", productController.updateProduct)

//DELETE PRODUCT BY PRODUCTID
router.delete("/products/:productId", productController.deleteProduct)



// ****************************==>FEATURE III - Cart<==***************************************

//CREATE CART
router.post("/users/:userId/cart", auth.authentication, auth.authorization, cartController.createCart)

//UPDATE CART
router.put("/users/:userId/cart", auth.authentication, auth.authorization, cartController.updateCart)

//GET CART
router.get("/users/:userId/cart", auth.authentication, auth.authorization, cartController.getCart)

//DELETE CART
router.delete("/users/:userId/cart", auth.authentication, auth.authorization, cartController.deleteCart)




// ****************************==>FEATURE IV - Order<==***************************************

//CREATE ORDER
router.post("/users/:userId/orders", auth.authentication, auth.authorization, orderController.createOrder)

//UPDATE ORDER
router.put("/users/:userId/orders", auth.authentication, auth.authorization, orderController.updateOrder)

//WRONG PATH
router.all('/*', (req, res) => {
    res.status(400).send({
        status: false,
        message: 'Path not found'
    })
})

module.exports = router