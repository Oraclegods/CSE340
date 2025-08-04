const utilities = require('../utilities');

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    flashMessages: {
      error: req.flash('error'),
      success: req.flash('success')
    }
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    flashMessages: {
        error: req.flash('error'),
        success: req.flash('success')
    }
  })
};


module.exports = { buildLogin, buildRegister }