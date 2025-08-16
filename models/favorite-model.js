const pool = require('../database/');

async function addFavorite(account_id, inv_id) {
  try {
    // Check if favorite exists first
    const checkSql = `SELECT * FROM favorites 
                     WHERE account_id = $1 AND inv_id = $2`;
    const exists = await pool.query(checkSql, [account_id, inv_id]);

    if (exists.rows.length > 0) {
      return { success: false, message: 'Already in favorites' };
    }

    // Add new favorite
    const insertSql = `INSERT INTO favorites (account_id, inv_id) 
                      VALUES ($1, $2) RETURNING *`;
    const result = await pool.query(insertSql, [account_id, inv_id]);
    
    return { 
      success: true,
      favorite: result.rows[0]
    };

  } catch (error) {
    if (error.code === '23505') { // Unique constraint error
      return { success: false, message: 'Already in favorites' };
    }
    console.error('Database error:', error);
    throw new Error('Failed to process favorite');
  }
}


async function getFavorites(account_id) {
  try {
    const sql = `SELECT i.* FROM inventory i
                 JOIN favorites f ON i.inv_id = f.inv_id
                 WHERE f.account_id = $1`;
    return await pool.query(sql, [account_id]);
  } catch (error) {
    console.error('Favorite model error:', error);
    throw new Error('Failed to get favorites');
  }
}



async function getFavoritesCount(account_id) {
  const sql = "SELECT COUNT(*) FROM favorites WHERE account_id = $1";
  const result = await pool.query(sql, [account_id]);
  return { count: parseInt(result.rows[0].count) };
}


module.exports = { addFavorite, getFavorites, getFavoritesCount };