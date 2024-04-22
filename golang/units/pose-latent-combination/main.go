package main

import (
	"log"
	"os"

	service "github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared"
	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/config"
	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/types"
)

func main() {

	// Load env vars
	if err := config.LoadEnvVariables("../../.env"); err != nil {
		log.Fatalf("Error loading environment variables: %v", err)
	}

	// Set up service config
	config := types.ServiceConfig{
		Port:   8080,
		Router: service.SetupRouter(),
		KafkaOptions: types.KafkaOptions{
			ClientID: os.Getenv("KAFKA_CLIENT_ID"),
			Brokers:  []string{os.Getenv("KAFKA_BROKER_URL")},
			Topics:   types.KafkaTopics{Consumer: "pose-latent-combination", Producer: "instance-synthesis"},
			GroupID:  "vision-middleware-units",
			//RequestProcessor: handleLatentRequest
		},
	}

	metadata := types.ServiceMetadata{
		ID:   "0002",
		Name: "Pose-Latent-Combination",
	}

	// Start service
	latentService := service.NewService(config, metadata)
	if err := latentService.Start(); err != nil {
		log.Fatalf("Error starting service: %v", err)
	}
}
