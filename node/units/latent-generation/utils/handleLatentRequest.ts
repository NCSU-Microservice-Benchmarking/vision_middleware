import client from '../../../shared/redis/client';
import { ClientCommandOptions } from '@redis/client/dist/lib/client';
import { commandOptions } from 'redis';

import buildRandomSeed from './buildRandomSeed';
import generateRandomImage from './generateRandomImage';

export default async function generateLatent(request: any): Promise<void> {
  try {
    const { videoUUID, frameNumber, instanceID } = request;
    const key = `${videoUUID}-${instanceID}`;

    const options: ClientCommandOptions = {
      // add any options?
    }

    // Check if (video UUID, instance ID) pair exists in the latent database
    const value = await client.get(commandOptions(options), key);
    if (value) {
      console.log(`Latent data for ${key} already exists. Skipping.`);
      return;
    }

    // Build a random seed with video UUID and instance ID
    const randomSeed: string = buildRandomSeed(videoUUID, instanceID);

    // Use the seed to generate a 128x128 random image as the latent
    const latentData: Buffer = generateRandomImage(randomSeed);

    // Store the (video UUID, instance ID) - latent pair in Redis
    await client.set(commandOptions(options), key, latentData);
    console.log(`Generated and stored latent data for ${key}`);
    return;
    
  } catch (error) {
    console.log(`Error generating latent.`, error);
    return;
  }
}