// consumer.go
package consumer

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type Consumer struct {
	consumer *kafka.Consumer
}

func NewConsumer(brokers, groupID, clientID string) (*Consumer, error) {
	configMap := &kafka.ConfigMap{
		"bootstrap.servers": brokers,
		"group.id":          groupID,
		"client.id":         clientID,
		"auto.offset.reset": "earliest", // Set to "earliest" or "latest" based on your requirements
		"enable.auto.commit": false,      // Disable automatic offset commits for manual control
		"max.poll.interval.ms": 600000,   // Adjust based on your use case
		"session.timeout.ms":   6000,     // Adjust based on your use case
	}

	consumer, err := kafka.NewConsumer(configMap)
	if err != nil {
		return nil, err
	}

	return &Consumer{consumer: consumer}, nil
}

func (c *Consumer) Subscribe(topics []string) error {
	return c.consumer.SubscribeTopics(topics, nil)
}

func (c *Consumer) Consume() {
	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	run := true

	for run {
		select {
		case sig := <-sigchan:
			fmt.Printf("Caught signal %v: terminating\n", sig)
			run = false
		default:
			msg, err := c.consumer.ReadMessage(-1)
			if err == nil {
				fmt.Printf("Received message: %v\n", string(msg.Value))
				// Process the message using your custom logic
			} else {
				fmt.Printf("Error reading message: %v\n", err)
			}
		}
	}
}

func (c *Consumer) CommitOffsets() {
	c.consumer.Commit()
}

func (c *Consumer) Close() {
	c.consumer.Close()
}
