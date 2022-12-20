const productModel = require('../model/productModel')
const { uploadFile } = require('./awsController')
const { isValidString, isIdValid, isValidProductName, isValidSize, isValidNumber, isValidPrice, isValidDecimalNumber } = require("../validator/validator")

//CREATE PRODUCT

const createProduct = async (req, res) => {
    try {
        const bodyData = req.body
        const file = req.files

        if (typeof (bodyData) == "undefined" || Object.keys(bodyData).length == 0) return res.status(400).send({ status: false, message: "Request body doesn't be empty" })

        const { title, description, price, currencyId, currencyFormat, style, availableSizes, installments } = bodyData

        if (!title) return res.status(400).send({ status: false, message: 'title is required' })
        if (!isValidString(title)) return res.status(400).send({ status: false, message: "Please enter the valid title" })
        if (!isValidProductName(title)) return res.status(400).send({ status: false, message: "Please enter the valid title(SpecialCase & Number is not Allowed)" })

        let titlePresent = await productModel.findOne({ title: title })
        if (titlePresent) return res.status(400).send({ status: false, message: "Title is already exists" })
        if (!description) return res.status(400).send({ status: false, message: 'description is required' })
        if (!isValidString(description)) return res.status(400).send({ status: false, message: "Please enter the valid description" })

        if (!price) return res.status(400).send({ status: false, message: 'price is required' })
        if (!isValidDecimalNumber(price)) return res.status(400).send({ status: false, message: "Please enter the valid price in format" })

        if (!currencyId) return res.status(400).send({ status: false, message: 'currencyId is required' })
        if (currencyId) {
            if (currencyId !== "INR") return res.status(400).send({ status: false, message: "CurrencyId should be in INR only" })
        }

        if (!currencyFormat) return res.status(400).send({ status: false, message: 'currencyFormat is required' })
        if (currencyFormat) {
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "currencyFormat should be in ₹ only" })
        }

        if (style) {
            if (!isValidString(style)) return res.status(400).send({ status: false, message: "Style should be in string only" })
        }

        if (availableSizes) {
            bodyData.availableSizes = availableSizes.toUpperCase()
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (!arr.includes(bodyData.availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is not given format" })
        }

        if (installments) {
            if (!isValidNumber(installments)) return res.status(400).send({ status: false, message: "Please enter the valid installments" })
        }

        if (req.body.isDeleted == false) {
            req.body.deletedAt = null
        }
        else {
            req.body.deletedAt = Date.now()
        }


        if (file && file.length > 0) {
            let uploadfile = await uploadFile(file[0]);
            bodyData.productImage = uploadfile;
        } else {
            return res.status(400).send({ status: false, message: "Upload profile Image" });
        }

        const productData = await productModel.create(bodyData)

        return res.status(201).send({ status: true, message: "Product created successfully", data: productData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//GET PRODUCTS BY FILTER
const getProductByFilter = async (req, res) => {
    try {
        const queryData = req.query

        let { name, pricesort, size, priceGreaterThan, priceLessThan } = queryData

        let filter = { isDelted: false }

        if (typeof (size) !== "undefined") {
            if (!isValidString(size)) {
                return res.status(400).send({ status: true, Message: "Invalid Available size." })
            }
            size = size.toUpperCase().split(",")
            if (size.length > 1) {
                return res.status(400).send({ status: false, message: "Available size must be Only One." })
            }
            if (!isValidSize(size[0])) {
                return res.status(400).send({ status: false, message: "Size should in this enum only ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']." })
            }
            filter.availableSizes = size
        }


        if (typeof (name) !== "undefined") {
            if (!isValidString(name)) {
                return res.status(400).send({ status: true, Message: "Name validation failed." })
            }
            if (!isValidProductName(name)) {
                return res.status(400).send({ status: true, Message: "Name Regex validation failed." })
            }
            filter.title = { $regex: name, $options: "i" }
        }

        if (typeof (priceGreaterThan) !== "undefined") {
            if (!isValidPrice(priceGreaterThan)) {
                return res.status(400).send({ status: false, message: "Please provide valid Price." })
            }
            filter.price = { $gt: priceGreaterThan }
        }

        if (typeof (priceLessThan) !== "undefined") {
            if (!isValidPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: "Please provide valid Price." })
            }
            filter.price = { $lt: priceLessThan }
        }

        if (typeof (priceGreaterThan) !== "undefined" && typeof (priceLessThan) !== "undefined") {
            if (!isValidPrice(priceGreaterThan) && !isValidPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: "Please provide valid Price." })
            }
            filter.price = { $lt: priceLessThan, $gt: priceGreaterThan }
        }

        if (typeof (pricesort) !== "undefined") {
            if (!(pricesort == -1 || pricesort == 1)) {
                return res.status(400).send({ status: false, message: "Please enter valid Price shorting -1 or 1." })
            }
        }

        const finalData = await productModel.find(filter).sort({ price: pricesort })

        if (finalData.length == 0) return res.status(404).send({ status: false, message: "No data found with Filter." })

        return res.status(200).send({ status: true, data: finalData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//GET PRODUCTS BY PARAMS
const getProductByParams = async (req, res) => {
    try {
        const productId = req.params.productId
        if (!isIdValid(productId))
            return res.status(400).send({ status: false, message: "product id is not valid" })

        const productData = await productModel.findById(productId)
        if(!productData) return res.status(400).send({ status: false, message: "No product Found with this id" })

        if (productData.isDeleted == true)
            return res.status(400).send({ status: false, message: "The product with this Id is Deleted." })
        if (!productData)
            return res.status(404).send({ status: false, message: "Product not found with this productId." })

        return res.status(200).send({ status: true, message: productData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




module.exports = { createProduct, getProductByFilter, getProductByParams }