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
            if (checkCart == null) {
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





module.exports = { createCart, updateCart }