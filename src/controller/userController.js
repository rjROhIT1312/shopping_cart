const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')

const { isValidPassword, isValidEmail, isIdValid, isValidString, isValidName, isValidMobile } = require("../validator/validator")

const registerUser = async (req, res) => {
    try {
        const bodyData = req.body

        if (Object.keys(bodyData) == 0) {
            return res.staus(400).send({ status: false, message: "Please provide data in body." })
        }

        const { fname, lname, email, profileImage, phone, password, address } = bodyData

        if (!fname) {
            return res.staus(400).send({ status: false, message: "Please provide ." })
        }

        const userData = await userModel.create(bodyData)

        return res.status(201).send({ status: true, message: "User created successfully", data: userData })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//login user

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const userData = await userModel.findOne({ email: email, password: password })

        const userId = userData._id

        const token = jwt.sign({ userId: userId.toString() }, "group30password", { expiresIn: "24h" })

        const data = {
            userId: userId,
            token: token
        }

        return res.status(200).send({ status: true, message: "User login successfull", data: data })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { registerUser, login }