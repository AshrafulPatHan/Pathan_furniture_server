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
## Common Status Codes
• 200 OK: The request was completely successful.
• 201 Created: A new resource was successfully created.
• 204 No Content: The request worked, but there is no body data to return.
• 301 Moved Permanently: The resource has a new permanent URL.
• 302 Found: The resource is temporarily at a different URL.
• 304 Not Modified: The local cached copy is still up to date.
• 400 Bad Request: The server could not understand the request.
• 401 Unauthorized: You need to log in or provide credentials.
• 403 Forbidden: The server refuses to give access.
• 404 Not Found: The requested page or file does not exist.
• 429 Too Many Requests: You hit a rate limit.
• 500 Internal Server Error: A general error happened on the server.
• 502 Bad Gateway: One server got an invalid response from another.
• 503 Service Unavailable: The server is overloaded or down for