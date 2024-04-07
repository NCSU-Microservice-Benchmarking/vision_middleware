import redisClient from '../../../shared/redis/client';

// Define cache keys
const originalCroppedInstancesCacheKey = 'original_cropped_instances_cache';
const originalInstanceSegmentationMasksCacheKey = 'original_instance_segmentation_masks_cache';
const synthesizedInstancesCacheKey = 'synthesized_instances_cache';
const synthesizedInstanceSegmentationMasksCacheKey = 'synthesized_instance_segmentation_masks_cache';

import type { request } from '../../../shared/types/request';

export default async function handleSegmentNewRequest(request: request): Promise<boolean | request> {
  try {
    const { video_uuid, frame_number, instance_id, type } = request;
    const cacheKey = `${video_uuid}:${frame_number}:${instance_id}`;

    // Check if the key exists in the cache for the requested type
    let dataExists: any = false;
    let data: any = null;
    switch (type) {
      case 'originalCroppedInstances':
        dataExists = await redisClient.exists(originalCroppedInstancesCacheKey);
        if (dataExists) {
          data = await redisClient.hGet(originalCroppedInstancesCacheKey, cacheKey);
        }
        break;
      case 'originalInstanceSegmentationMasks':
        dataExists = await redisClient.exists(originalInstanceSegmentationMasksCacheKey);
        if (dataExists) {
          data = await redisClient.hGet(originalInstanceSegmentationMasksCacheKey, cacheKey);
        }
        break;
      case 'synthesizedInstances':
        dataExists = await redisClient.exists(synthesizedInstancesCacheKey);
        if (dataExists) {
          data = await redisClient.hGet(synthesizedInstancesCacheKey, cacheKey);
        }
        break;
      case 'synthesizedInstanceSegmentationMasks':
        dataExists = await redisClient.exists(synthesizedInstanceSegmentationMasksCacheKey);
        if (dataExists) {
          data = await redisClient.hGet(synthesizedInstanceSegmentationMasksCacheKey, cacheKey);
        }
        break;
      default:
        break;
    }

    // If the required data exists, return it
    if (dataExists) {
      return data;
    } else {
      // For now, we'll return false indicating data is not available
      return false;
    }
  } catch (error) {
    console.error('Error processing segment-new instance combination request:', error);
    throw new Error(error);
  }
};
