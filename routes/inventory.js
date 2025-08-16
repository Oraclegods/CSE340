const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const invController = require("../controllers/inventoryController");
const { checkAccess } = require('../middleware/authMiddleware');

// Import validations separately
const classificationValidate = require("../utilities/classification-validation");
const inventoryValidate = require("../utilities/inventory-validation");

// Test route
router.get('/test', (req, res) => res.send("Inventory routes working!"));

// Management view
router.get('/', utilities.handleErrors(invController.buildManagement));

// Add classification routes
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));
router.post('/add-classification',
  classificationValidate.classificationRules(),
  classificationValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Add inventory routes
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));
router.post('/add-inventory',
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Classification view
router.get("/classification/:classification", utilities.handleErrors(invController.buildByClassification));

// Vehicle detail (MUST BE LAST)
router.get("/:inv_id", utilities.handleErrors(invController.buildVehicleDetail));
router.get('/detail/:inv_id', utilities.handleErrors(invController.buildVehicleDetail));



router.post('/add-classification', async (req, res) => {
  await db.query("INSERT INTO classification (name) VALUES (?)", [req.body.name]);
  res.redirect("/"); // Reloads the page, navbar updates
});

// checking access route
router.get('/add-classification', checkAccess, invController.buildAddClassification);
router.get('/add-inventory', checkAccess, invController.buildAddInventory);

// working with javascript
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


// Add this new route with proper commenting
/**
 * GET route for displaying the edit inventory view
 * @name editInventoryView
 * @route {GET} /inv/edit/:inv_id
 */
/*router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
); */


/* ****************************************
*  Edit Inventory View
* *************************************** */
router.get("/edit/:inv_id", invController.buildEditInventory);




module.exports = router;