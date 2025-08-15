const pool = require('../database/');

/* *****************************
*   Register new account
* *************************** */
async function accountRegister(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount; // Returns 0 (no match) or 1 (email exists)
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


// new models for account updates and passwards

async function getAccountById(accountId) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1";
    const data = await pool.query(sql, [accountId]);
    return data.rows[0];
  } catch (error) {
    throw error;
  }
}

async function updateAccount(accountId, firstName, lastName, email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const data = await pool.query(sql, [firstName, lastName, email, accountId]);
    return data.rows[0];
  } catch (error) {
    throw error;
  }
}

async function updatePassword(accountId, password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const data = await pool.query(sql, [password, accountId]);
    return data.rows[0];
  } catch (error) {
    throw error;
  }
}



module.exports = { 
  accountRegister, 
  checkExistingEmail, 
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword
};