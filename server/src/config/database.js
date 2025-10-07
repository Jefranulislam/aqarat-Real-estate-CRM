const { Pool } = require('pg');

console.log('Database URL:', process.env.DATABASE_URL ? 'Available' : 'Missing');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};