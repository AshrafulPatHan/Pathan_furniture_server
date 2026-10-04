const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const { neon } = require("@neondatabase/serverless");
const port = 3000;

app.use(cors());
app.use(express.json());

// connect sql database
const sql = neon(process.env.DATABASE_URL);

// Route: GET /  -> returns Postgres version
app.get("/", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.type("text/plain").send(result[0].version);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
