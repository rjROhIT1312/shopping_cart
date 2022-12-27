const cartModel = require("../model/cartModel");
const orderModel = require("../model/orderModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken")
const uploadFile = require("./awsController")
const bcrypt = require("bcrypt")

//create user
const registerUser = async (req, res) => {
    try {
        let bodyData = req.body
        let profileImage = req.files
        if (profileImage && profileImage.length > 0) {
            let uploadProfileImage = await uploadFile(profileImage[0])
            bodyData.profileImage = uploadProfileImage
        } else {
            return res.send({ msg: "upload img." })
        }
        bodyData.password = await bcrypt.hash(password, 10)
        const userData = await userModel.create(bodyData)
        return res.status(201).send({ data: userData })
    } catch (error) {
        return res.send({ message: error.message })
    }
}

//login user
const loginUser = async (req, res) => {
    try {
        let bodyData = req.body
        let { email, password } = bodyData

        const userData = await userModel.findOne({ email: email })

        let checkpassword = bcrypt.compare(password, userData.password)
        if (!checkpassword) {
            return res.send({ msg: "incorrect password" })
        }

        const token = jwt.sign({ userId: userData._id.toString() }, "secreatKey", { expiresIn: '24h' })
        const data = {
            userId: userData._id,
            token: token
        }
        return res.send({ data: data })
    } catch (error) {
        return res.send({ message: error.message })
    }
}

// get user by params
const getUserProfile = async (req, res)=> {
    try {
        const userId = req.params.userId
        
    } catch (error) {
        return res.send({ message: error.message })
    }
}

module.exports = { registerUser, loginUser, getUserProfile }