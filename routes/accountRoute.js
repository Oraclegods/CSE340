const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

// Unified path handling (all singular 'account')
router.get('/', utilities.handleErrors(accountController.buildLogin));
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.post('/authenticate', utilities.handleErrors(accountController.authenticate));

// Unified path handling (all singular 'register account')
// router.get('/', utilities.handleErrors(accountController.buildRegister));
// router.get('/register', utilities.handleErrors(accountController.buildRegister));


router.get('/register', utilities.handleErrors(accountController.buildRegister));
router.post('/register', utilities.handleErrors(accountController.accountRegister)); 

module.exports = router;