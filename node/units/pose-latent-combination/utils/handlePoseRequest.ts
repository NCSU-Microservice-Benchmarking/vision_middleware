import processPoseEstimationTag from './poseEstimationTag';
import processSegmentationBinaryMask from './segementationBinaryMask';

import type { request } from '../../../shared/types/request.d.ts';

export default async function handlePoseRequest(request: request): Promise<boolean | request> {
  try {
    let response: boolean | request = false; // Initialize to a default value
  
    if (request.type === 'pose_estimation_tag') {
      response = await processPoseEstimationTag(request);
    } else if (request.type === 'segmentation_binary_mask') {
      response = await processSegmentationBinaryMask(request);
    } else {
      // Handle unknown request type
      console.error('Unknown request type:', request.type);
      return Promise.reject();
    }
    
    return Promise.resolve(response);

  } catch (error) {
    return Promise.reject(error);
  }

}