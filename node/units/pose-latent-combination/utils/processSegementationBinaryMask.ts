import redisClient from '../../../shared/redis/client';

// Define cache keys
const poseEstimationCacheKey = 'pose_estimation_cache';
const segmentationMaskCacheKey = 'segmentation_mask_cache';

import type { request } from '../../../shared/types/request';

// Message processing function for segmentation binary mask requests
export default async function processSegmentationBinaryMask (request: request): Promise<boolean | request> {
  try {
    const { video_uuid, frame_number, instance_id, segmentationMask } = request;
    const cacheKey = `${video_uuid}:${frame_number}:${instance_id}`;
    
    // Check if the key exists in the pose estimation cache
    const poseEstimationExists = await redisClient.exists(poseEstimationCacheKey);
    
    if (!poseEstimationExists) {
      // Store segmentation binary mask in cache if pose estimation tag doesn't exist
      await redisClient.hSet(segmentationMaskCacheKey, cacheKey, segmentationMask);
      return true;
    } else {
      // Combine pose estimation tag and segmentation binary mask for instance synthesis request
      const poseEstimationTag = await redisClient.hGet(poseEstimationCacheKey, cacheKey);
      const instanceSynthesisRequest: request = {
        video_uuid: video_uuid,
        frame_number: frame_number,
        instance_id: instance_id,
        poseEstimationTag: poseEstimationTag,
        segmentationMask: segmentationMask
      };
      // Return instance synthesis request
      return instanceSynthesisRequest;
    }
  } catch (error) {
    console.error('Error processing segmentation binary mask request:', error);
    throw new Error(error);
  }
};