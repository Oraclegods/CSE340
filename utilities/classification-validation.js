const { body, validationResult } = require('express-validator');
const validate = {};

validate.classificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .notEmpty()
      .withMessage('Classification name is required')
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage('No spaces or special characters allowed')
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: errors.array(),
      flashMessages: {
        error: req.flash('error')
      }
    });
  }
  next();
};

module.exports = validate;