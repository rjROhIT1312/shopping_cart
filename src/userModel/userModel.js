const mongoose = require('mongoose');

const userSchema = new mongoose.Schema( {
    fname: {
        type: String, 
        trim : true ,
        required: true
    }, 
    lname: {
        type: String, 
        trim : true ,
        required: true
    }, 
    email: {
        type: String, 
        required: true, //valid
        unique: true
    },
    profileImage:{
        type: String, 
        required: true // s3 link
    },
    phone:{
        type: String, 
        required: true,
        unique:true //valid
    },
    password:{
        type: String, 
        required: true //minLen 8, maxLen 15},  encrypted password
    },
    address: {
        shipping: {
          street: {
            type:string, 
            required:true
        },
          city: {
            type:string, 
            required:true
        },
          pincode: {
            type:Number, 
            required:true
        }
        },
        billing: {
            street: {
                type:string, 
                required:true
            },
              city: {
                type:string, 
                required:true
            },
              pincode: {
                type:Number, 
                required:true
            }
        }
    }
    


}, { timestamps: true });

    

module.exports = mongoose.model('USER', userSchema)