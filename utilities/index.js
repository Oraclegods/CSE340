// utilities/index.js

const jwt = require("jsonwebtoken")
require("dotenv").config()

// Bring in the inventory model for DB access
const invModel = require('../models/inventory-model');

/**
 * Fetch classifications from DB for navigation.
 * Returns an array of objects like:
 * [{ classification_id: 1, classification_name: "SUV" }, ...]
 */
const getNav = async () => {
  try {
    const data = await invModel.getClassifications();
    return data.rows || [];
  } catch (error) {
    console.error('Error fetching classifications for nav:', error);
    return [];
  }
};

/**
 * Error-handling wrapper for async route handlers.
 * Prevents unhandled Promise rejections.
 */
const handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Build a classification <select> list for forms.
 * Pre-selects an option if classification_id is provided.
 */
const buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" class="form-control" required>';
    classificationList += '<option value="">Choose a Classification</option>';

    if (data.rows && data.rows.length > 0) {
      data.rows.forEach(row => {
        classificationList += `<option value="${row.classification_id}"`;
        if (classification_id != null && row.classification_id == classification_id) {
          classificationList += ' selected';
        }
        classificationList += `>${row.classification_name}</option>`;
      });
    }

    classificationList += '</select>';
    return classificationList;
  } catch (error) {
    console.error('Error building classification list:', error);
    return '<select name="classification_id" class="form-control"><option>Error loading classifications</option></select>';
  }
};


/* ****************************************
* Middleware to check token validity
**************************************** */
const Util = {};

Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("error", "Please log in.")
    return res.redirect("/account/login")
  }
 }


/* ****************************************
 * Password Validation Utility
 * *************************************** */
function checkPassword(password) {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}


// Export all utilities
module.exports = {
  getNav,
  handleErrors,
  buildClassificationList,
  Util,
  checkPassword
};
