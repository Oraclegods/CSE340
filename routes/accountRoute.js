const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation');
const { Util } = require('../utilities');
const favoriteController = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');


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

//new jwt middleware
router.post('/favorites', 
  requireAuth, // Uses the new middleware
  utilities.handleErrors(favoriteController.addToFavorites)
);


// account management new route
//router.get('/accountManagement', accountController.accountManagement);
router.get("/accountManagement", Util.checkLogin, utilities.handleErrors(accountController.accountManagement))



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


// favorite route 
router.post('/favorites', requireAuth, utilities.handleErrors(favoriteController.addToFavorites));
router.get('/favorites', requireAuth, utilities.handleErrors(favoriteController.showFavorites));
/*router.get('/favorites', 
  requireAuth,
  utilities.handleErrors(favoriteController.showFavorites)
); */



// Add to accountRoute.js
router.get('/account/favorites/debug', requireAuth, async (req, res) => {
  const dbData = await pool.query(
    `SELECT * FROM favorites WHERE account_id = $1`,
    [req.user.account_id]
  );
  
  res.json({
    sessionUser: req.user.account_id,
    dbResults: dbData.rows
  });
});



module.exports = router;