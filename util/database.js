
const mysql = require('mysql2');

require('dotenv').config();

const pool = mysql.createPool({
    connectTimeout: 30000,
    host: process.env.DB_CONNECTION,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

module.exports = pool.promise();

