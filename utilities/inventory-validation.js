const { body, validationResult } = require('express-validator');
const validate = {};

validate.inventoryRules = () => {
  return [
    body('classification_id')
      .notEmpty()
      .withMessage('Classification is required'),
    
    body('inv_make')
      .trim()
      .notEmpty()
      .withMessage('Make is required'),
    
    body('inv_model')
      .trim()
      .notEmpty()
      .withMessage('Model is required'),
    
    // Add validation for other fields
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    return res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body, // Makes form sticky
      flashMessages: {
        error: req.flash('error')
      }
    });
  }
  next();
};

module.exports = validate;