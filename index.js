const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const port = 3000;

app.use(cors())

// Initialize the connection pool using .env credentials
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// A helper function to run queries
async function queryDatabase() {
  try {
    // You can query the pool directly; it handles checking clients in/out
    const res = await pool.query('SELECT NOW()');
    console.log('Connected successfully. Current time:', res.rows[0].now);
  } catch (err) {
    console.error('Database query error:', err.stack);
  } finally {
    // Close the pool connections when your app shuts down
    await pool.end();
  }
}
queryDatabase();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
jjj