const productModel = require("../model/productModel")
const orderModel = require("../model/orderModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const { isIdValid } = require("../validator/validator")

//CREARTE ORDER
const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let bodyData = req.body
        let cartId = bodyData.cartId

        if (!cartId) {
            return res.status(400).send({
                status: false,
                message: "Please provide cartId in request body."
            })
        }
        if (!isIdValid(cartId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid cartId."
            })
        }

        const cartData = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cartData) {
            return res.status(404).send({
                status: false,
                message: "No cart found with this userId and cartId.."
            })
        }
        if (cartData.items.length == 0) {
            return res.status(400).send({
                status: false,
                message: "The cart is empty."
            })
        }

        let totalQuantity = 0
        for (let i = 0; i < cartData.items.length; i++) {
            totalQuantity = totalQuantity + cartData.items[i].quantity
        }

        let order = {
            userId: userId,
            items: cartData.items,
            totalPrice: cartData.totalPrice,
            totalItems: cartData.totalItems,
            totalQuantity: totalQuantity
        }

        const createOrder = await orderModel.create(order)

        const updateCart = await cartModel.findById(
            { _id: cartId },
            {
                $set: {
                    items: [],
                    totalPrice: 0,
                    totalItems: 0
                }
            },
            { new: true }
        )
        return res.status(201).send({ status: true, data: createOrder })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//UPDATE ORDER
const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const bodyData = req.body
        const { orderId, status } = bodyData
        if (!orderId) {
            return res.status(400).send({ status: false, message: "orderId should be present" })
        }
        if (!status) {
            return res.status(400).send({ status: false, message: "status should be present" })
        }
        let arr = ["completed", "cancled"]
        if (!arr.includes(status)) {
            return res.status(400).send({ status: false, message: "status should follow only this enum[completed, cancled] " })
        }
        if (!isIdValid(orderId)) {
            return res.status(400).send({ status: false, message: "invalid orderId" })
        }
        let orderData = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!orderData) {
            return res.status(404).send({ status: false, message: "No order found with this userId and orderId." })
        }
        if (orderData.cancellable == false) {
            return res.status(400).send({ status: false, message: "can not update order status,cancellable key is false" })

        }
        if (orderData.status == status) {
            return res.status(400).send({ status: false, message: " status is already present,please enter another one" })

        }
        const updateOrder = await orderModel.findByIdAndUpdate({ _id: orderId }, { $set: { status: status } }, { new: true })
        return res.status(200).send({ status: true, message: "sucess", data: updateOrder })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createOrder, updateOrder }