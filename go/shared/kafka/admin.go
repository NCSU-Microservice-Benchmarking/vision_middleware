package kafka

import (
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
