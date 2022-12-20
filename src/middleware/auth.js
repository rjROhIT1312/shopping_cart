const jwt = require('jsonwebtoken');
const { isIdValid } = require("../validator/validator")


//AUTHENTICATION
const authentication = async (req, res, next) => {
    try {
        let token = req.headers["authorization"]
        console.log(token)

        if (!token) {
            return res.status(400).send({ status: false, message: "Please provide token." })
        }

        const decodeToken = jwt.verify(token.split(" ")[1], "group30password", (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            } else {
                req.token = decodedToken
                next()
            }
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


//AUTHORIZATION
const authorization = async (req, res, next) => {
    try {
        const userId = req.params.userId

        if (!userId) {
            return res.status(400).send({ status: false, message: "Please provide userId in params." })
        }
        if (!isIdValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid UserId." })
        }

        const decodedToken = req.token
        const userIdfrmDecodedTkn = decodedToken.userId

        if (userId.toString() !== userIdfrmDecodedTkn) {
            return res.status(403).send({ status: false, message: "Access denied!!!" })
        }
        next() 

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { authentication, authorization }