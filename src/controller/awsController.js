const aws = require('aws-sdk')

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

// UPLOADILE FUNCTION

let uploadFile = async (file) => {

    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "project-3(group-42)/" + file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}

// CREATING AWS LINK

exports.createLink = async (req, res) => {
    try {
        let files = req.files

        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
            return res.status(201).send({ status: true, message: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            return res.status(400).send({ status: false, message: "No file found" })
        }

    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error })
    }
}