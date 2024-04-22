package types

// Request represents the request object
type Request struct {
	video_uuid        interface{}
	frame_number      interface{}
	instance_id       interface{}
	Type              interface{}
	PoseEstimationTag interface{}
	SegmentationMask  interface{}
}

// RequestProcessor defines the function signature for processing requests
type RequestProcessor func(request Request) (bool, Request, error)
