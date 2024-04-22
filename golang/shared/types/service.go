package types

import "github.com/gorilla/mux"

// SSL represents SSL configuration
type SSL struct {
	Cert string
	Key  string
}

// KafkaOptions represents options for Kafka
type KafkaOptions struct {
	ClientID         string
	Brokers          []string
	Topics           KafkaTopics
	GroupID          string
	RequestProcessor RequestProcessor
}

// KafkaTopics represents Kafka topics
type KafkaTopics struct {
	Consumer string
	Producer string
}

// ServiceConfig represents configuration for the service
type ServiceConfig struct {
	Port         int
	Router       *mux.Router
	KafkaOptions KafkaOptions
	SSL          *SSL
}

// ServiceMetadata represents metadata for the service
type ServiceMetadata struct {
	ID   string
	Name string
}

// Producer represents a Kafka producer
type Producer interface {
	Start() error
	Shutdown() error
	Send(message Request, topic string) error
}

// Consumer represents a Kafka consumer
type Consumer interface {
	Start() error
	Shutdown() error
	Subscribe() error
}

type ProducerCallback func(request Request, topic string) error

// Admin represents an administrative component
type Admin interface {
	Start() error
	Shutdown() error
}
