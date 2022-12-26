const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../model/userModel')
const { uploadFile } = require('./awsController')

const { isValidPassword, isValidEmail, isIdValid, isValidString, isValidNumber, isValidadd, isValidPin, isValidName, isValidMobile } = require("../validator/validator")

//REGISTER USER
const registerUser = async (req, res) => {
    try {
        const bodyData = req.body

        const profileImage = req.files

        if (typeof (bodyData) == "undefined" || Object.keys(bodyData).length == 0) return res.status(400).send({ status: false, message: "Request body doesn't be empty" })

        const { fname, lname, email, phone, password, address } = bodyData

        if (!fname) return res.status(400).send({ status: false, message: 'fname is required' })
        if (!isValidString(fname)) return res.status(400).send({ status: false, message: "Please enter the valid fname" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please enter the valid fname(SpecialCase & Number is not Allowed)" })

        if (!lname) return res.status(400).send({ status: false, message: 'lname is required' })
        if (!isValidString(lname)) return res.status(400).send({ status: false, message: "Please enter the valid lname" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please enter the valid lname(SpecialCase & Number is not Allowed)" })

        if (!email) return res.status(400).send({ status: false, message: 'email is required' })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please enter the valid email" })

        let emailPresent = await userModel.findOne({ email: email })
        if (emailPresent) return res.status(400).send({ status: false, message: "Email is already exist" })

        if (profileImage.length == 0) return res.status(400).send({ status: false, message: 'profileImage is required' })

        if (!phone) return res.status(400).send({ status: false, message: 'phone is required' })
        if (!isValidMobile(phone)) return res.status(400).send({ status: false, message: "Please enter the valid Mobile Number" })

        let phoneCheck = await userModel.findOne({ phone: phone })
        if (phoneCheck) return res.status(400).send({ status: false, message: "Mobile Number already exists" })

        if (!password) return res.status(400).send({ status: false, message: 'password is required' })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password must contain 1 Uppercase and Lowecase letter with at least 1 special charachter , password length should be 8-15 charachter. ex - Rahul@123" })

        if (profileImage && profileImage.length > 0) {
            let uploadProfileImage = await uploadFile(profileImage[0]);
            bodyData.profileImage = uploadProfileImage;
        } else {
            return res.status(400).send({ status: false, message: "Upload profile Image" });
        }

        // ---------> Address <---------
        try {
            if (!address) {
                return res.status(400).send({
                    status: false,
                    message: "address is mendetory"
                })
            }
            let adressObj = JSON.parse(address)

            // ---------> Shipping Address <---------

            if (!(adressObj.shipping))
                return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
            if (!isValidString(adressObj.shipping.street))
                return res.status(400).send({ status: false, message: "shipping Street is mandatory" })
            if (!isValidadd(adressObj.shipping.street))
                return res.status(400).send({ status: false, message: "shipping street containt only these letters [a-zA-Z_ ,.-]" })
            if (!isValidString(adressObj.shipping.city))
                return res.status(400).send({ status: false, message: "city is mandatory" })
            if (!isValidadd(adressObj.shipping.city))
                return res.status(400).send({ status: false, message: "shipping city containt only these letters [a-zA-Z_ ,.-]" })
            if (!isValidNumber(adressObj.shipping.pincode))
                return res.status(400).send({ status: false, message: "shipping pincode is mandatory" })
            if (!isValidPin(adressObj.shipping.pincode))
                return res.status(400).send({ status: false, message: "Please provide valid Pincode of 6 digits" })

            // ---------> Billing Address <---------

            if (!isValidString(adressObj.billing))
                return res.status(400).send({ status: false, message: "Please provide address for billing" })
            if (!isValidString(adressObj.billing.street))
                return res.status(400).send({ status: false, message: "billing Street is mandatory" })
            if (!isValidadd(adressObj.billing.street))
                return res.status(400).send({ status: false, message: "billing street containt only these letters [a-zA-Z_ ,.-]" })
            if (!isValidString(adressObj.billing.city))
                return res.status(400).send({ status: false, message: "city is mandatory" })
            if (!isValidadd(adressObj.billing.city))
                return res.status(400).send({ status: false, message: "billing city containt only these letters [a-zA-Z_ ,.-]" })
            if (!isValidNumber(adressObj.billing.pincode))
                return res.status(400).send({ status: false, message: " billing pincode is mandatory" })
            if (!isValidPin(adressObj.billing.pincode))
                return res.status(400).send({ status: false, message: "Please provide valid Pincode of 6 digits" })

            bodyData.address = adressObj

        }
        catch (error) {
            return res.status(500).send({ status: false, message: "Address is in invalid format." })
        }
        bodyData.password = await bcrypt.hash(password, 10)

        const userData = await userModel.create(bodyData)

        return res.status(201).send({ status: true, message: "User created successfully", data: userData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//LOGIN USER
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) return res.status(400).send({ status: false, message: 'email is required' })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Please enter the valid email" })

        if (!password) return res.status(400).send({ status: false, message: 'password is required' })

        const userData = await userModel.findOne({ email: email })
        if (!userData) return res.status(404).send({ status: false, message: "This email is not Registered." })

        let checkPassword = await bcrypt.compare(password, userData.password)
        if (!checkPassword) {
            return res.status(401).send({ status: false, message: "Incorrect Password." })
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


//GET USER PROFILE
const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId
        if (!isIdValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid." })
        }

        const userData = await userModel.findById(userId)
        if (!userData) {
            return res.status(404).send({ status: false, message: "No user found with this Id." })
        }

        return res.status(200).send({ status: true, message: "User profile details", data: userData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//UPDATE USER PROFILE
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId

        const bodyData = req.body
        const file = req.files

        if (typeof (bodyData) == "undefined" || Object.keys(bodyData).length == 0) return res.status(400).send({ status: false, message: "Please provide some data in body to update." })

        const { fname, lname, email, phone, password } = bodyData

        if (typeof (fname) !== "undefined") {
            if (!isValidName(fname)) {
                return res.status(400).send({ status: false, message: "Please provide valid fname." })
            }
        }

        if (typeof (lname) !== "undefined") {
            if (!isValidName(lname)) {
                return res.status(400).send({ status: false, message: "Please provide valid lname." })
            }
        }

        if (email) {
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "Please provide valid email." })
            }
            const uniqueCheck = await userModel.findOne({ email: email })
            if (uniqueCheck) {
                return res.status(400).send({ status: false, message: "This email is already Registered. Please provide another email, thank you🫡🫡🫡🫡." })

            }
        }


        if (phone) {
            if (!isValidMobile(phone)) {
                return res.status(400).send({ status: false, message: "Please provide valid phone number." })
            }
            const uniqueCheck = await userModel.findOne({ phone: phone })
            if (uniqueCheck) {
                return res.status(400).send({ status: false, message: "This phone number is already Registered. Please provide another phone number, thank you🫡🫡🫡🫡." })

            }
        }

        if (password) {
            if (!isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password must contain 1 Uppercase and Lowecase letter with at least 1 special charachter , password length should be 8-15 charachter. ex - Rahul@123" })
            }
            bodyData.password = await bcrypt.hash(password, 10)
        }


        if (bodyData.address || bodyData.address == "") {
            bodyData.address = JSON.parse(bodyData.address)
            if (!isValidString(bodyData.address)) {
                return res.status(400).send({ status: false, message: "Please provide address details!" });
            }

            if (bodyData.address.shipping) {
                if (typeof (bodyData.address.shipping) !== 'object') { return res.status(400).send({ status: true, msg: "shipping address is required and must be in object format" }) }

                if (bodyData.address.shipping.city) {
                    if (!isValidString(bodyData.address.shipping.street)) { return res.status(400).send({ status: false, message: "shipping street is invalid" }) }
                }

                if (bodyData.address.shipping.street) {
                    if (!isValidadd(bodyData.address.shipping.street) || !isValidString(bodyData.address.shipping.street)) { return res.status(400).send({ status: false, message: "shipping street is invalid" }) }
                }

                if (bodyData.address.shipping.pincode) {
                    if (!isValidPin(bodyData.address.shipping.pincode) || !isValidString(bodyData.address.shipping.pincode)) { return res.status(400).send({ status: false, message: "shipping pincode is invalid" }) }
                }

            }

            if (bodyData.address.billing) {
                if (typeof (bodyData.address.billing) !== 'object') { return res.status(400).send({ status: true, msg: "billing address is required and must be in object format" }) }

                if (bodyData.address.billing.city) {
                    if (!isValidString(bodyData.address.billing.street)) { return res.status(400).send({ status: false, message: "billing street is invalid" }) }
                }

                if (bodyData.address.billing.street) {
                    if (!isValidadd(bodyData.address.billing.street) || !isValidString(bodyData.address.billing.street)) { return res.status(400).send({ status: false, message: "shipping street is invalid" }) }
                }

                if (bodyData.address.billing.pincode) {
                    if (!isValidPin(bodyData.address.billing.pincode) || !isValidString(bodyData.address.billing.pincode)) { return res.status(400).send({ status: false, message: "shipping pincode is invalid" }) }
                }

            }
        }

        if (file && file.length > 0) {
            bodyData.profileImage = await uploadFile(file[0])
        }

        let updateData = await userModel.findByIdAndUpdate(
            { _id: userId },
            { $set: bodyData },
            { new: true }
        )

        return res.status(200).send({ status: true, message: "data updated successfully", data: updateData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { registerUser, login, getUserProfile, updateUser }