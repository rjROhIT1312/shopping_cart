const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")



const authentication = function (req, res, next) {
    try {
        let token = req.header("Authorization")
        if (!token) return res.status(404).send({ status: false, message: "Token is not present in header" })

        console.log("This is token : ", token)
        let splitToken = token.split(" ")


        let decoded = jwt.verify(splitToken[1], "group30password", {
            ignoreExpiration: true
        })
        if (Date.now() > decoded.exp * 1000) {
            return res.status(401).send({ status: false, message: "your token Session expired" });
        }

        req.userId = decoded.userId

        console.log("This is author Id of token : ", req.userId)
        next()
    }
    catch (err) {
        res.status(401).send({ status: false, msg: "authentication fail" })
    }

}

module.exports.authentication = authentication

