// admin.go
package admin

import (
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type Admin struct {
	admin *kafka.AdminClient
}

func NewAdmin(brokers []string) (*Admin, error) {
	configMap := &kafka.ConfigMap{
		"bootstrap.servers": brokers,
	}

	admin, err := kafka.NewAdminClient(configMap)
	if err != nil {
		return nil, err
	}

	return &Admin{admin: admin}, nil
}

func (a *Admin) Start() error {
	return nil // No explicit connection needed for AdminClient
}

func (a *Admin) Shutdown() {
	a.admin.Close()
}

func (a *Admin) CreateTopic(topic string, numPartitions, replicationFactor int) error {
	topicSpec := kafka.TopicSpecification{
		Topic:             topic,
		NumPartitions:     numPartitions,
		ReplicationFactor: replicationFactor,
	}

	results, err := a.admin.CreateTopics([]kafka.TopicSpecification{topicSpec}, nil)
	if err != nil {
		return err
	}

	for _, result := range results {
		if result.Error != nil {
			return fmt.Errorf("Error creating topic: %v", result.Error)
		}
	}

	return nil
}

func (a *Admin) DeleteTopic(topic string) error {
	results, err := a.admin.DeleteTopics([]string{topic}, nil)
	if err != nil {
		return err
	}

	for _, result := range results {
		if result.Error != nil {
			return fmt.Errorf("Error deleting topic: %v", result.Error)
		}
	}

	return nil
}
