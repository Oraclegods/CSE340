// /models/inventory-model.js
const pool = require('../database/');

async function getVehicleById(inv_id) {
  try {
    const result = await pool.query(
      'SELECT * FROM public.inventory WHERE inv_id = $1',
      [inv_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('getVehicleById error:', error);
  }
}

module.exports = { getVehicleById };
