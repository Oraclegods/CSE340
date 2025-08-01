const express = require("express");
const router = express.Router();
const utilities = require("../utilities"); // Import the entire utilities object
const inventoryController = require("../controllers/inventoryController");

// Test route
router.get('/test', (req, res) => {
  res.send("Inventory router is working!");
});

// I ADDed this new classification route
router.get("/classification/:classification", 
  utilities.handleErrors(inventoryController.buildByClassification));

// Vehicle detail route - using handleErrors from utilities
router.get("/:inv_id", utilities.handleErrors(inventoryController.buildVehicleDetail));

module.exports = router;