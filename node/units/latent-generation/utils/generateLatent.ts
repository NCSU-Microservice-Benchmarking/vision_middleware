import client from '../../../shared/redis/client';

export default async function generateLatent(videoUUID: string, frameNumber: number, instanceID: string): Promise<string> {
    const key = `${videoUUID}-${instanceID}`;

    // Check if (video UUID, instance ID) pair exists in the latent database
    client.get(key, (err: Error | null, result: string | null) => {
        if (err) {
            reject(err);
        } else if (result) {
            console.log(`Latent data for ${key} already exists. Skipping.`);
            resolve(result);
        } else {
            // Build a random seed with video UUID and instance ID
            const randomSeed = buildRandomSeed(videoUUID, instanceID);

            // Use the seed to generate a 128x128 random image as the latent
            const latentData = generateRandomImage(randomSeed);

            // Store the (video UUID, instance ID) - latent pair in Redis
            client.setex(key, 3600, latentData, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`Generated and stored latent data for ${key}`);
                    resolve(latentData);
                }
            });
        }
    });
}