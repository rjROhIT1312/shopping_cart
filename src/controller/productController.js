const productModel = require('../model/productModel')
const { uploadFile } = require('./awsController')

const createProduct = async (req, res) => {
    try {
        const bodyData = req.body
        const file = req.files

        const {title,description, price,currencyId,currencyFormat} = bodyData

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

module.exports = {createProduct}