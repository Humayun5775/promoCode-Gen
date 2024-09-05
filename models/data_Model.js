// data_model.js

const { sql, poolPromise } = require('../config/db');

async function executeQuery(query) {
  try {
    console.log(query);
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
}

module.exports = { executeQuery };
