package kafka

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/types"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type Producer struct {
	Name     string
	Producer *kafka.Producer
	Topic    string
}

func NewProducer(name string, options types.KafkaOptions) (*Producer, error) {

	config := &kafka.ConfigMap{
		"bootstrap.servers":        strings.Join(options.Brokers, ","),
		"message.send.max.retries": 10,
		"socket.keepalive.enable":  true,
	}

	p, err := kafka.NewProducer(config)
	if err != nil {
		return nil, err
	}
	// Initialize event handlers
	go handleEvents(p)

	return &Producer{
		Name:     name,
		Producer: p,
		Topic:    options.Topics.Producer,
	}, nil
}

func (p *Producer) Start() error {
	fmt.Printf("%s producer connected.", p.Name)
	return nil // No action needed to start in Go
}

func (p *Producer) Send(message types.Request) error {
	deliveryChan := make(chan kafka.Event)

	// Marshal the message to JSON
	newMessage, err := json.Marshal(message)
	if err != nil {
		return err
	}

	// send the message
	err = p.Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &p.Topic, Partition: kafka.PartitionAny},
		Value:          newMessage,
	}, deliveryChan)

	if err != nil {
		return err
	}

	// Handle delivery report
	ev := <-deliveryChan
	m := ev.(*kafka.Message)
	if m.TopicPartition.Error != nil {
		return m.TopicPartition.Error
	}

	log.Printf("Message sent to topic %s at offset %v\n", *m.TopicPartition.Topic, m.TopicPartition.Offset)
	return nil
}

// handleEvents handles events from the Kafka producer
func handleEvents(p *kafka.Producer) {
	for e := range p.Events() {
		switch ev := e.(type) {
		case *kafka.Message:
			if ev.TopicPartition.Error != nil {
				log.Printf("Delivery failed: %v\n", ev.TopicPartition.Error)
			} else {
				log.Printf("Delivered message to %s [%d] at offset %v\n",
					*ev.TopicPartition.Topic, ev.TopicPartition.Partition, ev.TopicPartition.Offset)
			}
		}
	}
}

func (p *Producer) Shutdown() error {
	defer p.Producer.Close()
	return nil
}
