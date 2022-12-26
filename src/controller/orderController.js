const userController = require("../controller/userController")

const productController = require("../controller/productController")

const userModel = require("../model/userModel")



const createOrder = async function (req, res) {
    try {

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const updateOrder = async function(req,res){
    try{

    }
    catch(error){
        return res.status(500).send({status : false, message : error.message})
    }
}


module.exports = { createOrder, updateOrder }