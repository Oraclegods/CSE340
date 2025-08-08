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
const handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Classification list builder
const invModel = require('../models/inventory-model');

const buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" class="form-control" required>';
    classificationList += '<option value="">Choose a Classification</option>';
    
    data.rows.forEach(row => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += ' selected';
      }
      classificationList += `>${row.classification_name}</option>`;
    });
    
    classificationList += '</select>';
    return classificationList;
  } catch (error) {
    console.error('Error building classification list:', error);
    return '<select name="classification_id" class="form-control"><option>Error loading classifications</option></select>';
  }
};

// Export all utilities
module.exports = {
  getNav,
  handleErrors,
  buildClassificationList
};