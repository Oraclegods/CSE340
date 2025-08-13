// utilities/index.js

// Bring in the inventory model for DB access
const invModel = require('../models/inventory-model');

/**
 * Fetch classifications from DB for navigation.
 * Returns an array of objects like:
 * [{ classification_id: 1, classification_name: "SUV" }, ...]
 */
const getNav = async () => {
  try {
    const data = await invModel.getClassifications();
    return data.rows || [];
  } catch (error) {
    console.error('Error fetching classifications for nav:', error);
    return [];
  }
};

/**
 * Error-handling wrapper for async route handlers.
 * Prevents unhandled Promise rejections.
 */
const handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Build a classification <select> list for forms.
 * Pre-selects an option if classification_id is provided.
 */
const buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" class="form-control" required>';
    classificationList += '<option value="">Choose a Classification</option>';

    if (data.rows && data.rows.length > 0) {
      data.rows.forEach(row => {
        classificationList += `<option value="${row.classification_id}"`;
        if (classification_id != null && row.classification_id == classification_id) {
          classificationList += ' selected';
        }
        classificationList += `>${row.classification_name}</option>`;
      });
    }

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
