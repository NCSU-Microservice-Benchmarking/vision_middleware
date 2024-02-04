import { RedisClientOptions, createClient } from 'redis';

const clientOptions: RedisClientOptions = {
  url: 'redis://localhost:6379',
  legacyMode: true,
  socket: {
    connectTimeout: 50000
  }
};
const redisClient: ReturnType<typeof createClient> = createClient(clientOptions);

redisClient.on("ready", () => console.log("Connected to Redis server successfully."));
redisClient.on('error', (err) => console.log('Redis Client Error.', err));

export default redisClient;

