/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const pool = require('./database/');
const expressLayouts = require("express-ejs-layouts");
const express = require("express");
const utilities = require("./utilities");
const baseController = require("./controllers/baseController");
const errorHandler = require("./middleware/errorHandler");
const inventoryRoute = require("./routes/inventory");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const flash = require('connect-flash');

/* ***********************
 * Middleware - PROPER ORDER IS CRITICAL
 *************************/

// 1. Session middleware (required for flash messages)
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// 2. Flash messages (requires session)
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// 3. Body parsers (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. View engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav();
    next();
  } catch (err) {
    next(err);
  }
});


/* ***********************
 * Routes - MOUNTED AFTER ALL MIDDLEWARE
 *************************/

// Static routes
app.use(static);

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inventory", inventoryRoute);

// Account routes (now body parsing will work)
app.use('/account', require('./routes/accountRoute'));

// management routes (usually near other app.use() calls)
app.use('/inv', require('./routes/inventory'));

/* ***********************
 * Error Handling - LAST MIDDLEWARE
 *************************/

// 404 handler
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
});

// Error handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

// Custom error handler middleware
app.use(errorHandler);

/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});