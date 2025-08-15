// controllers/inventoryController.js

const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

/* ****************************************
 * Existing Vehicle Detail Function (unchanged name)
 * **************************************** */
async function buildVehicleDetail(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      return res.status(404).render('errors/404', {
        title: 'Vehicle Not Found',
        message: 'Sorry, the vehicle you are looking for does not exist.',
        nav: await utilities.getNav(),
        flashMessages: { success: req.flash('success'), error: req.flash('error') }
      });
    }

    const nav = await utilities.getNav();

    res.render('./inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  } catch (error) {
    console.error('buildVehicleDetail error:', error);
    res.status(500).render('errors/500', {
      title: 'Server Error',
      message: 'Oops! Something went wrong on the server.',
      nav: await utilities.getNav(),
      flashMessages: { success: req.flash('success'), error: req.flash('error') },
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
}

/* ****************************************
 * Enhanced Classification View Function (unchanged name)
 * **************************************** */
async function buildByClassification(req, res, next) {
  try {
    const classification = String(req.params.classification || '').toLowerCase().trim();
    console.log(`Attempting to load ${classification} vehicles`);

    const vehicles = await invModel.getVehiclesByClassification(classification);
    const nav = await utilities.getNav();

    console.log(`Found ${Array.isArray(vehicles) ? vehicles.length : 0} vehicles for ${classification}`);
    if (Array.isArray(vehicles) && vehicles.length > 0) {
      console.log('Sample vehicle:', {
        id: vehicles[0].inv_id,
        name: `${vehicles[0].inv_year} ${vehicles[0].inv_make} ${vehicles[0].inv_model}`,
        thumbnail: vehicles[0].inv_thumbnail
      });
    }

    res.render('./inventory/classification', {
      title: `${classification.charAt(0).toUpperCase() + classification.slice(1)} Inventory`,
      nav,
      vehicles,
      classification,
      thumbnailPath: '/images/vehicles/',
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  } catch (error) {
    console.error(`buildByClassification error (${req.params.classification}):`, error);
    res.status(500).render('errors/500', {
      title: 'Classification Load Error',
      message: `Failed to load ${req.params.classification} vehicles`,
      error: process.env.NODE_ENV === 'development' ? error : null,
      nav: await utilities.getNav(),
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  }
}

/* ****************************************
 * Management view (unchanged name)
 * **************************************** */
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      flashMessages: {
        success: req.flash('success'),
        error: req.flash('error')
      },
      errors: null
    });
  } catch (error) {
    console.error('buildManagement error:', error);
    next(error);
  }
}

/* ****************************************
 * Build Add Classification form (unchanged name)
 * **************************************** */
async function buildAddClassification(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: null,
      classification_name: '',
      flashMessages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (error) {
    console.error('buildAddClassification error:', error);
    next(error);
  }
}

/* ****************************************
 * Handle Add Classification POST (same name)
 * - server-side validation
 * - sticky form (classification_name)
 * **************************************** */
async function addClassification(req, res, next) {
  const rawName = req.body.classification_name;
  const classification_name = rawName ? String(rawName).trim() : '';
  const nav = await utilities.getNav();

  const errors = [];

  // Required
  if (!classification_name) {
    errors.push({ msg: 'Classification name is required.', param: 'classification_name' });
  } else {
    // keep the original rule you've been using (letters + numbers, no spaces)
    const ok = /^[A-Za-z0-9]+$/.test(classification_name);
    if (!ok) {
      errors.push({ msg: 'Classification name must contain only letters and numbers (no spaces).', param: 'classification_name' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors,
      classification_name,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);
    const success = result && ((result.rowCount && result.rowCount > 0) || (Array.isArray(result) && result.length > 0) || result === true);

    if (success) {
      req.flash('success', 'Classification added successfully');
      return res.redirect('/inv');
    } else {
      // insertion failed gracefully
      return res.status(500).render('inventory/add-classification', {
        title: 'Add Classification',
        nav,
        errors: [{ msg: 'Failed to add classification.' }],
        classification_name,
        flashMessages: { success: req.flash('success'), error: req.flash('error') }
      });
    }
  } catch (error) {
    console.error('Error adding classification:', error);
    return res.status(500).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
      classification_name,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  }
}

/* ****************************************
 * Build Add Inventory form (unchanged name)
 * **************************************** */
async function buildAddInventory(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: null,
      formData: {}, // empty for first load
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  } catch (error) {
    console.error('buildAddInventory error:', error);
    next(error);
  }
}

/* ****************************************
 * Handle Add Inventory POST (same name)
 * - server-side validation
 * - sticky form (formData)
 * - prevents negative price/miles
 * **************************************** */
async function addInventory(req, res, next) {
  // collect submitted values (keep strings as-is for sticky)
  const formData = {
    classification_id: req.body.classification_id,
    inv_make: req.body.inv_make,
    inv_model: req.body.inv_model,
    inv_year: req.body.inv_year,
    inv_description: req.body.inv_description,
    inv_image: req.body.inv_image,
    inv_thumbnail: req.body.inv_thumbnail,
    inv_price: req.body.inv_price,
    inv_miles: req.body.inv_miles,
    inv_color: req.body.inv_color
  };

  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList(formData.classification_id);

  const errors = [];

  // validation rules
  if (!formData.classification_id || isNaN(Number(formData.classification_id))) {
    errors.push({ msg: 'Please select a classification.', param: 'classification_id' });
  }

  if (!formData.inv_make || !String(formData.inv_make).trim()) {
    errors.push({ msg: 'Make is required.', param: 'inv_make' });
  }

  if (!formData.inv_model || !String(formData.inv_model).trim()) {
    errors.push({ msg: 'Model is required.', param: 'inv_model' });
  }

  // Year: reasonable (1886 first car -> next year allowed)
  const yearNum = Number(formData.inv_year);
  if (!formData.inv_year || isNaN(yearNum) || yearNum < 1886 || yearNum > (new Date().getFullYear() + 1)) {
    errors.push({ msg: 'Enter a valid year.', param: 'inv_year' });
  }

  // price numeric and >= 0
  const priceNum = Number(formData.inv_price);
  if (formData.inv_price === undefined || formData.inv_price === '' || isNaN(priceNum) || priceNum < 0) {
    errors.push({ msg: 'Price must be a number >= 0.', param: 'inv_price' });
  }

  // miles numeric and >= 0
  const milesNum = Number(formData.inv_miles);
  if (formData.inv_miles === undefined || formData.inv_miles === '' || isNaN(milesNum) || milesNum < 0) {
    errors.push({ msg: 'Mileage must be a number >= 0.', param: 'inv_miles' });
  }

  if (!formData.inv_color || !String(formData.inv_color).trim()) {
    errors.push({ msg: 'Color is required.', param: 'inv_color' });
  }

  // Optionally ensure images/thumbnail not empty (adjust if they are optional)
  /* if (!formData.inv_image || !String(formData.inv_image).trim()) {
    errors.push({ msg: 'Image path is required.', param: 'inv_image' });
  }
  if (!formData.inv_thumbnail || !String(formData.inv_thumbnail).trim()) {
    errors.push({ msg: 'Thumbnail path is required.', param: 'inv_thumbnail' });
  }  */

  // If there are validation errors -> re-render with sticky form data
  if (errors.length > 0) {
    return res.status(400).render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors,
      formData,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  }

  // Build payload to match your model's expected shape (your model expects an object)
  const newInv = {
    classification_id: Number(formData.classification_id),
    inv_make: String(formData.inv_make).trim(),
    inv_model: String(formData.inv_model).trim(),
    inv_year: Number(formData.inv_year),
    inv_description: formData.inv_description ? String(formData.inv_description).trim() : null,
    inv_image: formData.inv_image ? String(formData.inv_image).trim() : null,
    inv_thumbnail: formData.inv_thumbnail ? String(formData.inv_thumbnail).trim() : null,
    inv_price: Number(formData.inv_price),
    inv_miles: Number(formData.inv_miles),
    inv_color: String(formData.inv_color).trim()
  };

  try {
    const result = await invModel.addInventory(newInv);
    const success = result && ((result.rowCount && result.rowCount > 0) || (Array.isArray(result) && result.length > 0) || result === true);

    if (success) {
      req.flash('success', 'Inventory added successfully');
      return res.redirect('/inv');
    }

    // DB insertion returned falsy/safe-failure
    return res.status(500).render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: [{ msg: 'Failed to add inventory.' }],
      formData,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  } catch (error) {
    console.error('Error adding inventory:', error);
    return res.status(500).render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: [{ msg: 'An unexpected error occurred. Please try again.' }],
      formData,
      flashMessages: { success: req.flash('success'), error: req.flash('error') }
    });
  }
}

/* ****************************************
 * Export Controllers (names preserved)
 * **************************************** */
module.exports = {
  buildVehicleDetail,
  buildByClassification,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory
};
