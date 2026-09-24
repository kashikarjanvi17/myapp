const mysql = require('mysql2/promise');
require('dotenv').config();

// A shared connection pool used by every controller.
// Using a pool (instead of a single connection) means concurrent
// requests don't block on one another and dropped connections are
// automatically replaced.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'exam_timetable_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE/TIME columns as plain strings, not JS Date objects
});

module.exports = pool;
