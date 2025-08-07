const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: req.body.account_email || '',
    flashMessages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function accountRegister(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Check for validation errors first
  if (req.errors && req.errors.length > 0) {
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors: req.errors,
      account_firstname,
      account_lastname,
      account_email,
      flashMessages: {
        error: req.flash('error')
      }
    });
  }

  try {
    // Hash the password asynchronously
    const hashedPassword = await bcrypt.hash(account_password, 10);
    
    const regResult = await accountModel.accountRegister(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount > 0) {
      req.flash(
        "success",
        `Congratulations, ${account_firstname}. Please log in.`
      );
      return res.redirect("/account/login");
    } else {
      req.flash("error", "Sorry, the registration failed.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
        flashMessages: {
          error: req.flash('error')
        }
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "An error occurred during registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      flashMessages: {
        error: req.flash('error')
      }
    });
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    errors: null,
    nav,
    account_firstname: '',
    account_lastname: '',
    account_email: '',
    flashMessages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
}

module.exports = { buildLogin, buildRegister, accountRegister };