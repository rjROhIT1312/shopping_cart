const mongoose = require('mongoose')

//=========================// isValidEmail //===================================

const isValidEmail = function (value) {
  let emailRegex =
    /^[a-z0-9_]{2,}@[a-z]{3,}.[com]{3}$/
  if (emailRegex.test(value)) return true;
};

//============================// idCharacterValid //============================

const isIdValid = function (value) {
  return mongoose.Types.ObjectId.isValid(value);
};

//==========================// isValidString //==================================

const isValidString = function (value) {
  if (typeof value === "undefined" || value === 'null') return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidNumber = function (value) {
  if (typeof value === "undefined" || value === 'null') return false;
  if (typeof value === "Number" && value.trim().length === 0) return false;
  return true;
};

//==============================// isValidName //===============================

const isValidName = function (name) {
  if (/^[a-zA-Z ]+$/.test(name)) {
    return true;
  }
};

const isValidProductName = function (name) {
  if (/^[a-zA-Z0-9 ]+$/.test(name)) {
    return true;
  }
};

//==============================// isValidMobile //===============================

const isValidMobile = function (mobile) {
  if (/^[0]?[6789]\d{9}$/.test(mobile)) {
    return true
  }
}

const isValidadd = function (value) {
  return (/^[a-zA-Z0-9_ ,.-]{2,50}$/).test(value)
}

const isValidPin = function (pin) {
  return /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pin);
}

//==============================// isValidPassword //==============================
 
const isValidPassword = function (pw) {
  let pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{8,15}$/;
  if (pass.test(pw)) return true;
};

const isValidDecimalNumber = function (decimal) {
  return /^(\d+\.?\d*)$/.test(decimal);
}

const isValidSize = function (value) {
  return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(value)
}

const isValidPrice = function (price) {
  return /^[1-9]\d{0,20}(?:\.\d{1,2})?$/.test(price)
}
//=============================// module exports //================================

module.exports = { isValidPassword, isValidEmail, isIdValid, isValidDecimalNumber, isValidString, isValidNumber, isValidName, isValidadd, isValidPin, isValidProductName, isValidMobile, isValidSize, isValidPrice }