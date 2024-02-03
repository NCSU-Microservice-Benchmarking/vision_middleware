import redisClient from './shared/redis/client';
import latentService from './units/latent-generation';

(async function () { 
  await redisClient.connect(); 
})();

latentService.start();