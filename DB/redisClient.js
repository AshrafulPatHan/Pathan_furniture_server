import 'dotenv/config';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL // Reads from your .env file
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Immediately connect
(async () => {
    await redisClient.connect();
    console.log('Connected to Redis Cloud');
})();

export default redisClient;