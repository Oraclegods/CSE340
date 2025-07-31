const express = require("express");
const router = express.Router();
const utilities = require("../utilities"); // Import the entire utilities object
const inventoryController = require("../controllers/inventoryController");

// Test route
router.get('/test', (req, res) => {
  res.send("Inventory router is working!");
});

// Vehicle detail route - using handleErrors from utilities
router.get("/:inv_id", utilities.handleErrors(inventoryController.buildVehicleDetail));

module.exports = router;