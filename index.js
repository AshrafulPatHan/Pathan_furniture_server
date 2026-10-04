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

// start project
app.get('/',(req,res) => {
  res.send("Start project")
})

// Route: GET /  -> returns Postgres version
app.get("/pgv", async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.type("text/plain").send(result[0].version);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// get all product data
app.get('/product',async(req,res) =>{
  try{
    const result = await sql`SELECT * FROM product `
    res.status(200).send(result)
  }catch (err){
    console.log(err);
    res.status(500).send("Erros is comming")
  }
})


// Post Product data
app.post('/post-product',async (req,res) =>{
  const { Name, Price, Size, Model, Details, Image } = req.body;
    
    // Simple validation rule
    if (!Name || !Price || !Size || !Model || !Details || !Image) {
        return res.status(400).json({ error: 'All fild required.' });
    }
  try{
    
    // insert Query and add all data into database
    const result = await sql`
      INSERT INTO product (name, price, size, model, details, image)
      VALUES (${Name}, ${Price}, ${Size}, ${Model}, ${Details}, ${Image})
      RETURNING *
    `;

    // send back a success status code 
    res.status(201).json({
      message: "Product Successfully added",
      data: result[0]
    });

  }catch (err){
    console.log(err);
    res.status(500).send("Erros is comming")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


