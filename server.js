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

const app = express();

/* ***********************
 * Middleware - PROPER ORDER IS CRITICAL
 *************************/

// 1. Cookie parser (should be first)
app.use(cookieParser());

// 2. Session middleware (required for flash messages)
const pgSession = connectPgSimple(session);
app.use(session({
  store: new pgSession({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, // Changed to false for better performance
  saveUninitialized: false, // Changed to false for GDPR compliance
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

//JWT middleware
// app.use(utilities.checkJWTToken)
app.use((req, res, next) => utilities.Util.checkJWTToken(req, res, next));

/* ***********************
 * Routes - MOUNTED AFTER ALL MIDDLEWARE
 *************************/

// Static routes
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute); // Consolidated to single inventory route

// Account routes
app.use('/account', accountRoute);
//app.use('/account', require('./routes/accountRoute'));

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

// Custom error handler middleware (if you have specific error handling logic)
app.use(errorHandler);

/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT || 5500; // Added fallback port
const host = process.env.HOST || 'localhost'; // Added fallback host

app.listen(port, () => {
  console.log(`Server running on http://${host}:${port}`);
});