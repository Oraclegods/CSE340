const utilities = require('../utilities');
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

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



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("error", "Invalid email or password"); // Changed to "error" type
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(), // Add this to pass flash messages
        errors: [],
        account_email
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("error", "Invalid email or password"); // Consistent error message
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(), // Add this to pass flash messages
        error: [],
        account_email
      });
    }

    // Successful login
    delete accountData.account_password;
    const accessToken = jwt.sign(
      accountData, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: 3600 * 1000 }
    );

    res.cookie("jwt", accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 3600 * 1000 
    });

    req.flash("success", "Login successful!"); // Success flash message
    return res.redirect("/account/accountManagement");

  } catch (error) {
    console.error('Login error:', error);
    req.flash("error", "Login failed. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash(),
      error: [],
      account_email: req.body.account_email || ''
    });
  }
}

// account management new function
async function accountManagement(req, res, next) {
    try {
        // Set flash message before rendering
        req.flash('success', 'Login successful!');
        
        res.render('account/accountManagement', {
            title: 'Account Management',
            messages: req.flash() // This retrieves all flash messages
        });
    } catch (error) {
    req.flash("error", "Error loading account management");
    res.redirect('/account/login');
    next(error);
    }
}

module.exports = { buildLogin, buildRegister, accountRegister, accountLogin, accountManagement };