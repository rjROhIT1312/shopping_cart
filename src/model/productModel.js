const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, trim: true }, //valid number/decimal
    currencyId: { type: String, required: true, trim: true }, //INR
    currencyFormat: { type: String, required: true, trim: true },//Rupee symbol
    isFreeShipping: { type: Boolean, default: false },
    productImage: { type: String, required: true, trim: true }, // s3 link
    style: { type: String },
    availableSizes: { type: [String], enum: ["S", "XS", "M", "X", "L", "XXL", "XL"] },
    installments: { type: Number },
    deletedAt: { type: Date }, //when the document is deleted
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true })


module.exports = mongoose.model("product", productSchema)