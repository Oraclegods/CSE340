const utilities = require("../utilities");
const favoriteModel = require("../models/favorite-model");

const buildHome = async function (req, res, next) {
  const nav = await utilities.getNav();
  
  // Get favorites count if logged in
  let favoritesCount = 0;
  if (res.locals.loggedin && res.locals.accountData) {
    try {
      const result = await favoriteModel.getFavoritesCount(res.locals.accountData.account_id);
      favoritesCount = result.count;
    } catch (error) {
      console.error("Error getting favorites count:", error);
    }
  }

  res.render("index", {
    title: "Home",
    nav,
    loggedin: res.locals.loggedin, // Pass through from middleware
    favoritesCount // Will be 0 if not logged in
  });
}

module.exports = { buildHome };
