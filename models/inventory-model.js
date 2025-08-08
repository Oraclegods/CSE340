const pool = require('../database/');

/* ****************************************
* Get Vehicle by ID (Unchanged)
* **************************************** */
async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM public.inventory WHERE inv_id = $1',
      [inv_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('getVehicleById error:', error);
    return null;
  }
}

/* ****************************************
* Final Vehicle Classification Query
* Features:
* 1. Uses EXACT image paths from your database
* 2. Case-insensitive classification matching
* 3. Guaranteed image path in response
* 4. Enhanced debug logging
* **************************************** */
async function getVehiclesByClassification(classificationName) {
  console.log(`\n=== DEBUG: Fetching ${classificationName} vehicles ===`);

  try {
    // 1. Find classification ID (case-insensitive)
    const classResult = await pool.query(
      `SELECT classification_id 
       FROM classification 
       WHERE LOWER(classification_name) = LOWER($1)`, 
      [classificationName]
    );

    if (classResult.rows.length === 0) {
      console.error(`[ERROR] Classification "${classificationName}" not found`);
      return [];
    }

    const classId = classResult.rows[0].classification_id;
    console.log(`[DEBUG] Using classification ID: ${classId}`);

    // 2. Get vehicles with guaranteed image paths
    const vehicleResult = await pool.query(
      `SELECT 
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        -- Use database paths exactly as stored
        COALESCE(
          NULLIF(inv_image, ''),
          NULLIF(inv_thumbnail, ''),
          '/images/vehicles/default-car.jpg'
        ) AS image_path
       FROM inventory
       WHERE classification_id = $1`,
      [classId]
    );

    console.log(`[SUCCESS] Found ${vehicleResult.rows.length} vehicles`);
    
    // 3. Log sample data for verification
    if (vehicleResult.rows.length > 0) {
      console.log('[DEBUG] Sample vehicle:', {
        id: vehicleResult.rows[0].inv_id,
        make: vehicleResult.rows[0].inv_make,
        model: vehicleResult.rows[0].inv_model,
        image_path: vehicleResult.rows[0].image_path  // Verifying final path
      });
    }

    return vehicleResult.rows;
  } catch (error) {
    console.error(`[CRITICAL ERROR]`, {
      classification: classificationName,
      error: error.message,
      stack: error.stack
    });
    return [];
  }
}

// add classification model .......................................
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    throw error;
  }
}


// addInventor model..................................................
async function addInventory(inventoryData) {
  try {
    const sql = `INSERT INTO inventory (
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
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    
    return await pool.query(sql, [
      inventoryData.classification_id,
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image || '/images/vehicles/no-image.png',
      inventoryData.inv_thumbnail || '/images/vehicles/no-image-tn.png',
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color
    ]);
  } catch (error) {
    throw error;
  }
}


// Add this new function to your existing exports
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

module.exports = { 
  getVehicleById, 
  getVehiclesByClassification,
  addClassification,
  addInventory,
  getClassifications
};