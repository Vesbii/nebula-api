// This file establishes the database connection and waits for a query from databaseserver.js

var mysql = require('mysql');
require('dotenv').config()

var mysql_pool  = mysql.createPool({
  connectionLimit : 100,
  user: "vesbiiAccess", 
  password: "134*1O5MOJbs",
  host: "chingle-nebula.ckr1ms3nrfmt.ap-southeast-1.rds.amazonaws.com", 
  database: "nebulaDB",
});

mysql_pool.getConnection(function(err, conn) {
  if (err) {
    connection.release();
      console.log(' Error getting mysql_pool connection: ' + err);
      throw err;
  }
})

module.exports = mysql_pool;