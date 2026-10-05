import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
import { neon } from '@neondatabase/serverless';
import redisClient from './DB/redisClient.js';
const { Pool } = pg;
const port = 3000;


app.use(cors());
app.use(express.json());

// connect sql database
const sql = neon(process.env.DATABASE_URL);

// start project
app.get('/', (req, res) => {
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
app.get('/product', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM product `
    res.status(200).send(result)
  } catch (err) {
    console.log(err);
    res.status(500).send("Erros is comming")
  }
})

// get all product data Efficently 
app.get('/all-product', async (req, res) => {
    const cacheKey = 'all_products'; // Unique key for this data

  try {
    // 1. Try to get data from Redis first
    const cachedData = await redisClient.get(cacheKey);

     if (cachedData) {
      console.log('Serving from Redis Cache');
      return res.status(200).send(JSON.parse(cachedData));
    }

    // 2. Cache Miss: Query the database
    console.log('Querying SQL Database');
    const result = await sql`SELECT * FROM product`;

    // 3. Save the result to Redis for next time
    // 'EX' 3600 means the cache will expire in 1 hour (3600 seconds)
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 3600, 
    });

     res.status(200).send(result);

  } catch (err) {
    console.log(err);
    res.status(500).send("Erros is comming")
  }
})


// Post Product data
app.post('/post-product', async (req, res) => {
  const { Name, Price, Size, Model, Details, Image } = req.body;

  // Simple validation rule
  if (!Name || !Price || !Size || !Model || !Details || !Image) {
    return res.status(400).json({ error: 'All fild required.' });
  }
  try {

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

  } catch (err) {
    console.log(err);
    res.status(500).send("Erros is comming")
  }
})

// update any product data
app.patch('/product/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if the user actually sent any fields to update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'At least one field is required to update.' });
  }

  try {
    // 1. Fetch the existing product first to handle partial updates safely
    const existingProduct = await sql`
            SELECT * FROM product WHERE id = ${id}
        `;

    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const current = existingProduct[0];

    // 2. Fallback to existing data if the field isn't provided in req.body
    // Use lowercase or matching database column mappings as needed
    const updatedName = updates.Name !== undefined ? updates.Name : current.name;
    const updatedPrice = updates.Price !== undefined ? updates.Price : current.price;
    const updatedSize = updates.Size !== undefined ? updates.Size : current.size;
    const updatedModel = updates.Model !== undefined ? updates.Model : current.model;
    const updatedDetails = updates.Details !== undefined ? updates.Details : current.details;
    const updatedImage = updates.Image !== undefined ? updates.Image : current.image;

    // 3. Run the update query
    const result = await sql`
            UPDATE product 
            SET 
                name = ${updatedName}, 
                price = ${updatedPrice}, 
                size = ${updatedSize}, 
                model = ${updatedModel}, 
                details = ${updatedDetails}, 
                image = ${updatedImage}
            WHERE id = ${id}
            RETURNING *
        `;

    // Send back the updated product
    res.status(200).json({
      message: "Product successfully updated",
      data: result[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE route targeting a specific user ID
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params; // 1. Extract the ID from the URL parameter

  try {
    // 2. Use \$1 as a safe placeholder for parameterized query execution
    const result = await sql`DELETE FROM product WHERE id = ${id} RETURNING *`;

    // valident result
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // 4. Return success along with the details of the deleted row
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      deletedUser: result[0]
    });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An internal server error occurred.',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


