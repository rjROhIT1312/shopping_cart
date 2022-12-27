const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")
const { isIdValid } = require("../validator/validator") 


//----------------------------------------><< CREATECART >><--------------------------------------------//

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId } = req.body

        //-----------------checking user-----------------//
        if (!userId || !isIdValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid userId."
            })
        }
        const checkUser = await userModel.findById(userId)
        if (!checkUser) {
            return res.status(404).send({
                status: false,
                message: "user not found"
            })
        }

        //-------------------checking product-----------------------//
        if (!productId || !isIdValid(productId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid productId."
            })
        }
        const checkProduct = await productModel.findById(productId)
        if (checkProduct == null || checkProduct.isDeleted == true) {
            return res.status(404).send({
                status: false,
                message: "Product not found or it may be deleted"
            })
        }

        //=>Creating Item for add.
        let itemForAdd = {
            productId: productId,
            quantity: 1
        }

        if (cartId) {
            //------------------checking cart-----------------//
            if (!isIdValid(cartId)) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide a valid cartId."
                })
            }
            const checkCart = await cartModel.findById(cartId)
            if (checkCart == null) {
                return res.status(404).send({
                    status: false,
                    message: "cart not found"
                })
            }
            const cartdbdata = await cartModel.findOne({ userId })
            if (cartdbdata._id != cartId) {
                return res.status(400).send({
                    status: false,
                    message: "The cart is not owned by This userId."
                })
            }

            let arr = checkCart.items

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == itemForAdd.productId) {
                    arr[i].quantity = arr[i].quantity + itemForAdd.quantity;
                    break
                }
                else if (i == (arr.length - 1)) {
                    arr.push(itemForAdd)
                    break
                }
            }

            //=>this is for when items array is empty i.e. checkCart.items.length=0
            if (arr.length == 0) {
                arr.push(itemForAdd)
            }
            const dataForUpdate = {
                userId: userId,
                items: arr,
                totalPrice: checkProduct.price + checkCart.totalPrice,
                totalItems: arr.length
            }
            const updateCart = await cartModel.findByIdAndUpdate(
                { _id: cartId },
                { $set: dataForUpdate },
                { new: true }
            ).populate("items.productId", ("price title description productImage availableSizes"))

            return res.status(201).send({ status: true, message: "Success", data: updateCart })

        }
        else {
            const checkCart = await cartModel.findOne({ userId: userId })
            if (checkCart) {
                return res.status(400).send({
                    status: false,
                    message: "A cart with this userId already present,  Please provide that CartId."
                })
            }

            const dataForCreate = {
                userId: userId,
                items: [itemForAdd],
                totalPrice: checkProduct.price,
                totalItems: 1
            }
            const createCart1 = await cartModel.create(dataForCreate)

            return res.status(201).send({
                status: true,
                message: "Success",
                data: createCart1
            })

        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



//-----------------------------------------><< UPDATE CART >><-------------------------------------------//

const updateCart = async (req, res) => {
    try {
        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body

        //-------------------checking use----------------------//
        if (!userId || !isIdValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid userId."
            })
        }
        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({
                status: false,
                message: "user not found with this Id."
            })
        }

        //--------------------checking product-------------------//
        if (!productId || !isIdValid(productId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid productId."
            })
        }
        const productData = await productModel.findById({ _id: productId, isDeleted: false })
        if (!productData) {
            return res.status(404).send({
                status: false,
                message: "Product not found or it may be deleted"
            })
        }

        //--------------------checking cart----------------------//
        if (!cartId || !isIdValid(cartId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid cartId."
            })
        }
        const cartData = await cartModel.findById(cartId)
        if (!cartData) {
            return res.status(404).send({
                status: false,
                message: "cart not found with this Id."
            })
        }
        const cartdbdata = await cartModel.findOne({ userId })
        if (cartdbdata._id != cartId) {
            return res.status(400).send({
                status: false,
                message: "The cart is not owned by This userId."
            })
        }

        //-----------------checking removeProduct----------------//
        if (typeof (removeProduct) == "undefined") {
            return res.status(400).send({
                status: false,
                message: "Please enter removeProduct attribute in request body, ex:- {removeProduct : 0,removeProduct : 1 } "
            })
        }

        if (!(removeProduct === 0 || removeProduct === 1)) {
            return res.status(400).send({
                status: false,
                message: "Please enter remove product value 0 or 1."
            })
        }

        let arr = cartData.items
        let totalItems = cartData.totalItems
        let totalPrice = cartData.totalPrice

        let cartCheck = 0
        for (let i = 0; i < arr.length; i++) {
            if (cartData.items[i].productId == productId) {
                cartCheck = 1
                if (removeProduct == 0 || cartData.items[i].quantity == 1) {
                    totalPrice = totalPrice - ((productData.price) * (cartData.items[i].quantity))
                    totalItems = totalItems - 1
                    arr.splice(i, 1)
                    break;
                } else {
                    cartData.items[i].quantity -= 1
                    totalPrice -= productData.price
                    break;
                }
            }
        }

        if (cartCheck == 0) {
            return res.status(404).send({
                status: false,
                message: "No data present in cart with this productId."
            })
        }

        let updateCart = await cartModel.findByIdAndUpdate(
            { _id: cartId },
            {
                $set: {
                    items: arr,
                    totalItems: totalItems,
                    totalPrice: totalPrice
                }
            },
            { new: true }
        ).populate("items.productId", ("price title description productImage availableSizes"))

        return res.status(200).send({
            status: true,
            message: 'Cart updated successfully', data: updateCart
        })

    } catch (error) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//--------------------------------------------><< GET CART >><-------------------------------------------//

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isIdValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "Please provide a valid userId."
            })
        }
        let userExists = await userModel.findById({ _id: userId })
        if (!userExists) {
            return res.status(400).send({
                status: false,
                message: "No user found with this Id."
            })
        }
        let cart = await cartModel.findOne({ userId: userId }).populate("items.productId", ("price title description productImage availableSizes"))
        if (!cart) {
            return res.status(400).send({
                status: false,
                message: "No cart found with this userId"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Success",
            data: cart
        })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

//------------------------------------------><< DELETE CART >><------------------------------------------//

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isIdValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "userId not valid"
            })
        }
        let isUSerPresent = await userModel.findById(userId)
        if (!isUSerPresent) {
            return res.status(400).send({
                status: false,
                message: "userId not exist"
            })
        }

        let isCArtUSerPresent = await cartModel.findOne({ userId: userId })
        if (!isCArtUSerPresent) {
            return res.status(400).send({
                status: false,
                message: "this user dont have any cart"
            })
        }
        if (isCArtUSerPresent.totalItems == 0) {
            return res.status(404).send({
                status: false,
                message: "The cart is already deleted."
            })
        }
        let deleteData = await cartModel.findOneAndUpdate(
            { userId: userId },
            {
                $set: {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            },
            { new: true }
        )

        return res.status(204).send({
            status: true,
            message: "data deleted successfully",
            data: deleteData
        })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}





module.exports = { createCart, updateCart, getCart, deleteCart }