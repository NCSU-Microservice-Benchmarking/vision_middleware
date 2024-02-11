import processPoseEstimationTag from './poseEstimationTag';
import segmentationBinaryMask from './segementationBinaryMask';

export default async function handlePoseRequest (request: any) {
  if (request.type === 'pose_estimation_tag') {
    await processPoseEstimationTag(request);
  } else if (request.type === 'segmentation_binary_mask') {
    await segmentationBinaryMask(request);
  }
  return;
}