import redisClient from '../../../shared/redis/client';

// Define cache keys
const poseEstimationCacheKey = 'pose_estimation_cache';
const segmentationMaskCacheKey = 'segmentation_mask_cache';

import type { request } from '../../../shared/types/request';

export default async function processPoseEstimationTag (request: request): Promise<boolean | request> {
  try {
    const { video_uuid, frame_number, instance_id, poseEstimationTag } = request;
    const cacheKey = `${video_uuid}:${frame_number}:${instance_id}`;
    
    // Check if the key exists in the segmentation binary mask cache
    const segmentationMaskExists = await redisClient.exists(segmentationMaskCacheKey);
    
    if (!segmentationMaskExists) {
      // Store pose estimation tag in cache if segmentation binary mask doesn't exist
      await redisClient.hSet(poseEstimationCacheKey, cacheKey, poseEstimationTag);
      return true;
    } else {
      // Combine pose estimation tag and segmentation binary mask for instance synthesis request
      const segmentationMask = await redisClient.hGet(segmentationMaskCacheKey, cacheKey);
      const instanceSynthesisRequest: request = {
        video_uuid: video_uuid,
        frame_number: frame_number,
        instance_id: instance_id,
        poseEstimationTag: poseEstimationTag,
        segmentationMask: segmentationMask
      };
      // Put instance synthesis request into the "Instance replacement request queue"
      return instanceSynthesisRequest;
    }
  } catch (error) {
    console.error('Error processing pose estimation tag request:', error);
    throw new Error(error);
  }
};