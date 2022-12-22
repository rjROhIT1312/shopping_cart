const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const productModel = require("../model/productModel")

const { isValidString, isIdValid, isValidName, isValidProductName, isValidSize, isValidNumber, isValidPrice, isValidDecimalNumber } = require("../validator/validator")



const createCart = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!isIdValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid." })
        }

        let userData = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!userData) return res.status(404).send({ status: false, message: "No user found with this Id or user is deleted." })

        let bodyData = req.body
        let { cartId, productId } = bodyData

        if (!productId) return res.status(400).send({ status: false, message: "Please enter productId in request body." })
        if (!isIdValid(productId)) return res.status(400).send({ status: false, message: "productId is invalid." })

        let productData = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productData) return res.status(404).send({ status: false, message: "No product found with this Id or product is deleted." })

        let cartUser = await cartModel.findOne({ userId: userId, isDeleted: false })

        if (!cartUser) {
            let cart = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: 1
                }],
                totalPrice: productData.price,
                totalItems: 1
            }
            const saveCart = await cartModel.create(cart)
            return res.status(201).send({ status: true, message: "Cart Successfully created.", data: saveCart })
        }

        // if(!cartId) return res.staus(400).send({ status: false, message: "Please enter cartId in request body." })
        // if(!isIdValid(cartId)) return res.status(400).send({status : false, message : "Invalid cartId."})

        // let cartData = await cartModel.findById(cartId)
        // if(!cartData) return res.staus(404).send({status : false, message : "No product found with this cartId."})


        // let proArr = cartData.items
        // let totalItems = cartData.totalItems
        // let totalPrice = cartData.totalPrice

        // let count = 0
        // for(let i=0; i<proArr.length; i++){
        //     if(proArr[i].productId === productId){
        //         proArr[i].quantity += 1
        //         totalPrice += productData.price
        //         count++
        //     }
        // }

        // return res.send("not working")








    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { createCart }