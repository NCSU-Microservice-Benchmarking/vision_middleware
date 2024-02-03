import redisClient from './shared/redis/client';

import latentService from './units/latent-generation';
import poseService from './units/pose-latent-combination';
import segmentService from './units/segment-new-instance-combination';

(async function () { 
  await redisClient.connect(); 

  latentService.start();
  poseService.start();
  segmentService.start();

  return;
})();

