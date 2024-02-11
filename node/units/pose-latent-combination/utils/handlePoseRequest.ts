import processPoseEstimationTag from './poseEstimationTag';
import segmentationBinaryMask from './segementationBinaryMask';

import type { request } from '../../../shared/types/request.d.ts';

export default async function handlePoseRequest (request: request) {
  if (request.type === 'pose_estimation_tag') {
    await processPoseEstimationTag(request);
  } else if (request.type === 'segmentation_binary_mask') {
    await segmentationBinaryMask(request);
  }
  return;
}