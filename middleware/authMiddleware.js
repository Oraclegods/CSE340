const jwt = require('jsonwebtoken');
require('dotenv').config();

/* Check JWT token */
function checkJWTToken(req, res, next) {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decodedToken) => {
        if (err) {
          res.locals.loggedin = false;
          next();
        } else {
          res.locals.loggedin = true;
          res.locals.accountData = decodedToken;
          next();
        }
      }
    );
  } else {
    res.locals.loggedin = false;
    next();
  }
}

/* Check if user is employee or admin */
function checkAccess(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash('notice', 'Please log in to access this page.');
    return res.redirect('/account/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.account_type !== 'Employee' && decoded.account_type !== 'Admin') {
      req.flash('notice', 'You do not have sufficient privileges.');
      return res.redirect('/account/login');
    }
    next();
  } catch (err) {
    req.flash('notice', 'Invalid token. Please log in again.');
    res.redirect('/account/login');
  }
}



module.exports = { checkJWTToken, checkAccess };