const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const { isValidString, isIdValid, isValidName, isValidProductName, isValidSize, isValidNumber, isValidPrice, isValidDecimalNumber } = require("../validator/validator")



const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId } = req.body
        //-------------------------------------checking user------------------------------------------//
        if (!userId || !isIdValid(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
        const checkUser = await userModel.findById(userId)
        if (!checkUser) {
            return res.status(404).send({ status: false, message: "user not found" })
        }
        //-------------------------------------checking product------------------------------------------//
        if (!productId || !isIdValid(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
        const checkProduct = await productModel.findById(productId)
        if (checkProduct == null || checkProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product not found or it may be deleted" })
        }
        //-------------------------------------------------------------------------------------------//
        let itemForAdd = {
            "productId": productId,
            "quantity": 1
        }

        if (cartId) {
            //-------------------------------------checking cart------------------------------------------//
            if (!isIdValid(cartId)) { return res.status(400).send({ status: false, message: "Please provide a valid cartId." }) }
            const checkCart = await cartModel.findById(cartId)
            if (checkCart == null ) {
                return res.status(404).send({ status: false, message: "cart not found" })
            }
        //-------------------------------------------------------------------------------------------//
        let arr = checkCart.items

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].productId == itemForAdd.productId) {
                arr[i].quantity = arr[i].quantity + itemForAdd.quantity;
                break
            }
          
        }

        /////this is for when items array is empty i.e. items.length=0
        if (arr.length == 0) {
            arr.push(itemForAdd)
        }
        const dataForUpdate = {
            "userId": userId,
            "items": arr,
            "totalPrice": checkProduct.price + checkCart.totalPrice,
            "totalItems": arr.length
        }
        const updateCard = await cartModel.findByIdAndUpdate(
            { "_id": cartId },
            { $set: dataForUpdate },
            { new: true }
        )
        //.populate("items.productId", ("price title description productImage availableSizes"))
        return res.status(201).send({ status: true, message: "Success", data: updateCard })

    }
        else {
    const checkCart = await cartModel.findOne({ userId: userId })
    if (checkCart) {
        return res.status(400).send({ status: false, message: "A cart with this userId already present try to edit that cart" })
    }

    const dataForCreate = {
        "userId": userId,
        "items": [itemForAdd],
        "totalPrice": checkProduct.price,
        "totalItems": 1
    }
    const createCart1 = await cartModel.create(dataForCreate)



    return res.status(201).send({ status: true, message: "Success", data: createCart1 })

}
    } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
}
}



/*
### PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
- Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart.
- Get cart id in request body.
- Get productId in request body.
- Get key 'removeProduct' in request body. 
- Make sure that cart exist.
- Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}).
- Make sure the userId in params and in JWT token match.
- Make sure the user exist
- Get product(s) details in response body.
- Check if the productId exists and is not deleted before updating the cart.
- __Response format__
  - _**On success**_ - Return HTTP status 200. Also return the updated cart document. The response should be a JSON object like [this](#successful-response-structure)
  - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

  */


const updateCart = async function (req, res) {
    let userId = req.params.userId
    if (!isIdValid(userId)) return res.send({ message: "userId not valid" })
    let isUserPresent = await userModel.findById(userId)
    if (!isUserPresent) return res.send({ message: "userId not exist" })

    let data = req.body
    let { cartId, productId } = data
    if (cartId) {
        if (!isIdValid(cartId)) return res.send({ message: "cardId not valid" })
        let isCartPresent = await cartModel.findById(cartId)
        if (!isCartPresent) return res.send({ message: "cartId not exist" })
    }
    if (productId) {
        if (!isIdValid(productId)) return res.send({ message: "productId not valid" })
        let isProductPresent = await cartModel.findById(productId)
        if (!isProductPresent) return res.send({ message: "productId not exist" })
    }

    let newData = await cartModel.findByIdAndUpdate({ _id: cartId }, { $set: { cartId, productId } }, { new: true })
    return res.send({ message: newData })

}


module.exports = { createCart, updateCart }