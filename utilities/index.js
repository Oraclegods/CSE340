// For future dynamic nav building (e.g., from DB or config)
const navItems = [
  { name: "Home", url: "/" },
  { name: "Inventory", url: "/inventory" },
  { name: "About", url: "/about" },
  { name: "Contact", url: "/contact" },
  { name: "Login", url: "/account/login" }
];

// Dynamically build a nav bar
const getNav = async () => {
  let nav = `<nav class="nav-bar">`;
  navItems.forEach(item => {
    nav += `<a class="nav-link" href="${item.url}">${item.name}</a>`;
  });
  nav += `</nav>`;
  return nav;
};

// Generic error-handling wrapper
const Util = {};
Util.handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Export all utilities
module.exports = {
  getNav,
  handleErrors: Util.handleErrors
};