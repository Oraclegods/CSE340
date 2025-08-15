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
      req.flash("error", "Invalid email or password");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
        errors: [],
        account_email
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("error", "Invalid email or password");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
        error: [],
        account_email
      });
    }

    // Create token payload with ONLY needed data
    const tokenPayload = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type // Explicitly include account type
    };

    const accessToken = jwt.sign(
      tokenPayload, // Use the explicit payload instead of full accountData
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: 3600 * 1000 }
    );

    res.cookie("jwt", accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 3600 * 1000 
    });

    req.flash("success", "Login successful!");
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
            messages: req.flash(), // This retrieves all flash messages
            accountData: res.locals.accountData || {} // ✅ Pass the data
        });
    } catch (error) {
    req.flash("error", "Error loading account management");
    res.redirect('/account/login');
    next(error);
    }
}


// new functions for account updates, passward, logout

/* Build update view */
async function buildUpdate(req, res, next) {
  try {
    const accountData = await accountModel.getAccountById(req.params.accountId);
    res.render('account/update', {
      title: 'Update Account',
      accountData
    });
  } catch (error) {
    next(error);
  }
}

/* Process account update */
async function updateAccount(req, res, next) {
  try {
    // Validate input
    const errors = [];
    if (!req.body.account_firstname) errors.push('First name is required');
    if (!req.body.account_lastname) errors.push('Last name is required');
    if (!req.body.account_email) errors.push('Email is required');
    
    if (errors.length > 0) {
      req.flash('errors', errors);
      return res.redirect(`/account/update/${req.body.account_id}`);
    }
    
    // Check if email exists (if changed)
    const existingAccount = await accountModel.getAccountByEmail(req.body.account_email);
    if (existingAccount && existingAccount.account_id != req.body.account_id) {
      req.flash('notice', 'Email already exists');
      return res.redirect(`/account/update/${req.body.account_id}`);
    }
    
    // Update account
    await accountModel.updateAccount(
      req.body.account_id,
      req.body.account_firstname,
      req.body.account_lastname,
      req.body.account_email
    );
    
    // Get updated account data
    const updatedAccount = await accountModel.getAccountById(req.body.account_id);
    
    // Update JWT token
    const token = jwt.sign(
      updatedAccount,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    
    res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    req.flash('notice', 'Account updated successfully');
    res.redirect('/account');
  } catch (error) {
    next(error);
  }
}

/* Process password update */
async function updatePassword(req, res, next) {
  try {
    // Validate password
    const passwordErrors = utilities.checkPassword(req.body.account_password);
    if (passwordErrors.length > 0) {
      req.flash('errors', passwordErrors);
      return res.redirect(`/account/update/${req.body.account_id}`);
    }
    
    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(req.body.account_password, 10);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
    
    // Update password
    await accountModel.updatePassword(req.body.account_id, hashedPassword);
    
    req.flash('notice', 'Password updated successfully');
    res.redirect('/account');
  } catch (error) {
    next(error);
  }
}

/* Logout */
function logout(req, res) {
  res.clearCookie('jwt');
  res.redirect('/');
}



module.exports = { 
  buildLogin, 
  buildRegister, 
  accountRegister, 
  accountLogin, 
  accountManagement,
  buildUpdate,
  logout,
  updateAccount,
  updatePassword,

};