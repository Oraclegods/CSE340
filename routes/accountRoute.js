const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation');
const { Util } = require('../utilities');

/* ****************************************
*  ROOT ACCOUNT ROUTE (REDIRECT TO LOGIN)
* **************************************** */
router.get('/', utilities.handleErrors((req, res) => {
  res.redirect('/account/login');
}));

/* ****************************************
*  LOGIN ROUTES
* **************************************** */
router.get('/login', utilities.handleErrors(accountController.buildLogin));

router.post(
  '/login',
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// account management new route
//router.get('/accountManagement', accountController.accountManagement);
router.get("/accountManagement", Util.checkLogin, utilities.handleErrors(accountController.accountManagement))

// Test route
router.get('/test-flash', (req, res) => {
  req.flash('notice', 'This is a test message');
  res.redirect('/account/login');
});


/* ****************************************
*  REGISTRATION ROUTES
* **************************************** */
router.get('/register', utilities.handleErrors(accountController.buildRegister));

router.post(
  '/register',
  validate.registationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.accountRegister)
);

// new routes for account update, and passward update
router.get('/update/:accountId', accountController.buildUpdate);
router.post('/update', accountController.updateAccount);
router.post('/update-password', accountController.updatePassword);
router.get('/logout', accountController.logout);


module.exports = router;