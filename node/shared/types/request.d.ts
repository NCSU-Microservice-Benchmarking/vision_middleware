export interface request {
  video_uuid: any,
  frame_number: any
  instance_id: any,
  type?: any,
  poseEstimationTag?: any,
  segmentationMask?: any
}

export type requestProcessor = (request: request) => Promise<boolean | request>