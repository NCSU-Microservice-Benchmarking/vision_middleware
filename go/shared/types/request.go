package types

// Request represents the request object
type Request struct {
	VideoUUID         interface{}
	FrameNumber       interface{}
	InstanceID        interface{}
	Type              interface{}
	PoseEstimationTag interface{}
	SegmentationMask  interface{}
}

// RequestProcessor defines the function signature for processing requests
type RequestProcessor func(request Request) (bool, Request, error)
