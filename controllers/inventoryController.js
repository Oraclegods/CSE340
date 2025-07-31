// /controllers/inventoryController.js
const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

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
      vehicle // ✅ Pass the whole vehicle object
    });
  } catch (error) {
    console.error('buildVehicleDetail error:', error);
    res.status(500).render('errors/500', {
      title: 'Server Error',
      message: 'Oops! Something went wrong on the server.'
    });
  }
}

module.exports = { buildVehicleDetail };