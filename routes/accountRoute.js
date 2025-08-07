const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation');

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

module.exports = router;