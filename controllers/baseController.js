const utilities = require("../utilities");

const buildHome = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("index", {
    title: "Home",
    nav
  });
}

module.exports = { buildHome }
