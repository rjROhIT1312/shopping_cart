const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../model/userModel')
const {uploadFile}  = require('./awsController')

const { isValidPassword, isValidEmail, isIdValid, isValidString, isValidName, isValidMobile } = require("../validator/validator")

const registerUser = async (req, res) => {
    try {
        const bodyData = req.body

        const profileImage = req.files

       if(typeof(bodyData)=="undefined"||Object.keys(bodyData).length==0) return res.status(400).send({status:false,message:"Request body doesn't be empty"})

        const { fname, lname, email, phone, password, address } = bodyData

        if (!fname) return res.status(400).send({ status: false, message: 'fname is required' })
        if(!isValidString(fname))  return res.status(400).send({status:false,message:"Please enter the valid fname"})

        if (!lname) return res.status(400).send({ status: false, message: 'lname is required' })
        if(!isValidString(lname))  return res.status(400).send({status:false,message:"Please enter the valid lname"})

        if (!email) return res.status(400).send({ status: false, message: 'email is required' })
        if(!isValidEmail(email))  return res.status(400).send({status:false,message:"Please enter the valid email"})

        let emailPresent = await userModel.findOne({email:email})
        if (emailPresent) return res.status(400).send({status:false,message:"Email is already exist"})

        //if (!profileImage) return res.status(400).send({ status: false, message: 'profileImage is required' })

        if (!phone) return res.status(400).send({ status: false, message: 'phone is required' })
        if(!isValidMobile(phone))  return res.status(400).send({status:false,message:"Please enter the valid Mobile Number"})

        let phoneCheck = await userModel.findOne({phone:phone})
        if(phoneCheck) return res.status(400).send({status:false,message:"Mobile Number already exists"})

        if (!password) return res.status(400).send({ status: false, message: 'password is required' })
        if(!isValidPassword(password))  return res.status(400).send({status:false,message:"Password must contain 1 Uppercase and Lowecase letter with at least 1 special charcter , password length should be 8-15"})

        if(profileImage && profileImage.length > 0){

        let uploadProfileImage = await uploadFile(profileImage[0]);
          bodyData.profileImage = uploadProfileImage;
    
        } else {
          return res
            .status(400)
            .send({ status: false, message: "Upload profile Image" });
        }

        bodyData.password =await bcrypt.hash(password,10)

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

        if (!email) return res.status(400).send({ status: false, message: 'email is required' })
        if (!password) return res.status(400).send({ status: false, message: 'password is required' })

        
        const userData = await userModel.findOne({ email: email })
        if(!userData) return res.status(404).send({status:false,message:"Email is invalid"})

        let checkPassword = await bcrypt.compare(password, userData.password)

        if(!checkPassword){
            return res.status(400).send({status : false , message : "Incorrect Password."})
        }

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


// GET USER PROFILE

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId

        const userData = await userModel.findById(userId)

    
        return res.status(200).send({ status: true, message: "User profile details", data: userData })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { registerUser, login, getUserProfile }