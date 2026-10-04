# There are some Tutorial I use on this project

- [Neon Postgresql Tutorial](https://youtu.be/doIFdMp7D2E)
- [Connect PostgreSql Node Tutorial](https://node-postgres.com/features/connecting)
- []()

## Connect to Neon database

```js
require("dotenv").config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(version);
};

http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```
