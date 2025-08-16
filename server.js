/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const pool = require('./database/');
const connectPgSimple = require('connect-pg-simple');
const flash = require('connect-flash');
const cookieParser = require("cookie-parser");
const env = require("dotenv").config();
const utilities = require("./utilities");
const baseController = require("./controllers/baseController");
const errorHandler = require("./middleware/errorHandler");
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventory");
const accountRoute = require("./routes/accountRoute");
const { checkJWTToken } = require('./middleware/authMiddleware');

const app = express();

/* ***********************
 * Middleware - PROPER ORDER IS CRITICAL
 *************************/

// 1. Cookie parser (should be first)
app.use(cookieParser());

// ===== NEW: Request Logger =====
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// 2. Session middleware
const pgSession = connectPgSimple(session);
app.use(session({
  store: new pgSession({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000 // 1 hour
  }
}));

// 3. Flash messages (requires session)
app.use(flash());

// 4. Body parsers (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== NEW: Static File Caching =====
app.use(express.static('public', { 
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '1d',
  etag: true
}));


// Ensure this middleware exists and comes AFTER session setup
app.use((req, res, next) => {
  res.locals.account_id = req.session?.account_id || null; // Add this line
  res.locals.loggedin = req.session?.loggedin || false;
  res.locals.accountData = req.session?.accountData || null;
  next();
});

// Add to server.js (temporary test route)
app.get('/test-session', (req, res) => {
  console.log('Current session:', req.session);
  res.json({
    sessionID: req.sessionID,
    sessionData: req.session
  });
});


// 5. View engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// 6. Custom middleware for nav data
app.use(async (req, res, next) => {
  try {
    res.locals.messages = req.flash(); // Makes flash messages available in all views
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});

// Session middleware 
app.use((req, res, next) => {
  res.locals.loggedin = req.session?.loggedin || false;
  res.locals.accountData = req.session?.accountData || null;
  next();
});

// JWT middleware
app.use((req, res, next) => utilities.Util.checkJWTToken(req, res, next));
app.use(checkJWTToken);

/* ***********************
 * Routes - MOUNTED AFTER ALL MIDDLEWARE
 *************************/

// Static routes
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use('/account', accountRoute);

/* ***********************
 * Error Handling - LAST MIDDLEWARE
 *************************/

// 404 handler
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

// Main error handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

// Custom error handler middleware
app.use(errorHandler);


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`Server running on http://${host}:${port}`);
});