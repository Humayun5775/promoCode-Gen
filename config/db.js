const sql = require('mssql');
const config = require('./config')[process.env.NODE_ENV || 'development'];


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server: ' + pool.config.server);
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ' + err.message);
    throw err;
  });

module.exports = {
  sql, poolPromise
};
