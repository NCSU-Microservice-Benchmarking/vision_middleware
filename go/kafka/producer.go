// producer.go
package producer

import (
	"fmt"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type Producer struct {
	producer *kafka.Producer
}

func NewProducer(brokers, clientID string) (*Producer, error) {
	configMap := &kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"client.id":         clientID,
	}

	producer, err := kafka.NewProducer(configMap)
	if err != nil {
		return nil, err
	}

	return &Producer{producer: producer}, nil
}

func (p *Producer) Produce(topic, message string) error {
	deliveryChan := make(chan kafka.Event)

	err := p.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          []byte(message),
	}, deliveryChan)

	if err != nil {
		return err
	}

	// Wait for the delivery report
	e := <-deliveryChan
	m := e.(*kafka.Message)

	if m.TopicPartition.Error != nil {
		return fmt.Errorf("Delivery failed: %v", m.TopicPartition.Error)
	}

	fmt.Printf("Produced message to topic %s [partition %d] at offset %v\n",
		*m.TopicPartition.Topic, m.TopicPartition.Partition, m.TopicPartition.Offset)

	close(deliveryChan)
	return nil
}

func (p *Producer) Close() {
	p.producer.Close()
}
