export interface request {
  videoUUID: any,
  frameNumber: any
  instanceID: any,
  type?: any,
  poseEstimationTag?: any,
  segmentationMask?: any
}

export type requestProcessor = (request: request) => Promise<boolean | request>