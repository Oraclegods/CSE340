const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

/* ****************************************
* Existing Vehicle Detail Function (Unchanged)
* **************************************** */
async function buildVehicleDetail(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);

    if (!vehicle) {
      return res.status(404).render('errors/404', {
        title: 'Vehicle Not Found',
        message: 'Sorry, the vehicle you are looking for does not exist.'
      });
    }

    const nav = await utilities.getNav();

    res.render('./inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle
    });
  } catch (error) {
    console.error('buildVehicleDetail error:', error);
    res.status(500).render('errors/500', {
      title: 'Server Error',
      message: 'Oops! Something went wrong on the server.'
    });
  }
}

/* ****************************************
* Enhanced Classification View Function
* **************************************** */
async function buildByClassification(req, res, next) {
  try {
    const classification = req.params.classification.toLowerCase(); // Ensure lowercase
    console.log(`Attempting to load ${classification} vehicles`); // Debug log

    const vehicles = await invModel.getVehiclesByClassification(classification);
    const nav = await utilities.getNav();

    // Debugging output
    console.log(`Found ${vehicles.length} vehicles for ${classification}`);
    if (vehicles.length > 0) {
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
      // Added for better error handling in view
      thumbnailPath: '/images/vehicles/'
    });
  } catch (error) {
    console.error(`buildByClassification error (${req.params.classification}):`, error);
    res.status(500).render('errors/500', {
      title: 'Classification Load Error',
      message: `Failed to load ${req.params.classification} vehicles`,
      error: process.env.NODE_ENV === 'development' ? error : null
    });
  }
}


/* ****************************************
// build management controller...................
* **************************************** */

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    flashMessages: {
      success: req.flash('success'),
      error: req.flash('error')
    }
  });
}

/* ****************************************
// build add classification controller...................
* **************************************** */
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: null,
    flashMessages: {
      error: req.flash('error')
    }
  });
}

async function addClassification(req, res, next) {
  const { classification_name } = req.body;
  
  try {
    const result = await invModel.addClassification(classification_name);
    if (result.rowCount > 0) {
      req.flash('success', 'Classification added successfully');
      res.redirect('/inv');
    } else {
      req.flash('error', 'Failed to add classification');
      res.redirect('/inv/add-classification');
    }
  } catch (error) {
    req.flash('error', 'Error adding classification');
    res.redirect('/inv/add-classification');
  }
}


/* ****************************************
*   add/build inventory Controllers
* **************************************** */

async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: null,
    flashMessages: {
      error: req.flash('error')
    }
  });
}

async function addInventory(req, res, next) {
  const { 
    classification_id, 
    inv_make, 
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
    // Add other fields
  } = req.body;
  
  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
      // Add other fields
    });
    
    if (result.rowCount > 0) {
      req.flash('success', 'Inventory added successfully');
      res.redirect('/inv');
    } else {
      req.flash('error', 'Failed to add inventory');
      res.redirect('/inv/add-inventory');
    }
  } catch (error) {
    console.error('Error adding inventory:', error);
    req.flash('error', 'Error adding inventory');
    res.redirect('/inv/add-inventory');
  }
}



/* ****************************************
* Export Controllers
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