package kafka

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/NCSU-Microservice-Benchmarking/vision_middleware/go/shared/types"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type Consumer struct {
	Name             string
	Consumer         *kafka.Consumer
	Topic            string
	RequestProcessor types.RequestProcessor
	ProducerCallback types.ProducerCallback
	ProducerTopic    string
}

func NewConsumer(name string, options types.KafkaOptions, producerCallback types.ProducerCallback) (*Consumer, error) {
	configMap := &kafka.ConfigMap{
		"bootstrap.servers":    strings.Join(options.Brokers, ","),
		"group.id":             options.GroupID,
		"client.id":            options.ClientID,
		"auto.offset.reset":    "earliest",
		"enable.auto.commit":   false,
		"max.poll.interval.ms": 600000,
		"session.timeout.ms":   6000,
	}

	consumer, err := kafka.NewConsumer(configMap)
	if err != nil {
		return nil, err
	}

	return &Consumer{
		Name:             name,
		Consumer:         consumer,
		Topic:            options.Topics.Consumer,
		RequestProcessor: options.RequestProcessor,
		ProducerCallback: producerCallback,
		ProducerTopic:    options.Topics.Producer,
	}, nil
}

func (c *Consumer) Start() error {
	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	// Subscribe to topics and consume
	if err := c.Subscribe([]string{c.Topic}); err != nil {
		return fmt.Errorf("error subscribing to topics: %v", err)
	}
	go c.Consume()
	fmt.Printf("%s consumer connected.", c.Name)
	return nil
}

func (c *Consumer) handleMessage(msg *kafka.Message) {
	// Parse message for the request
	var req types.Request
	json.Unmarshal(msg.Value, &req)

	// Process the request
	cached, newRequest, err := c.RequestProcessor(req)
	if err != nil {
		fmt.Println("Error processing request:", err)
		return
	}

	// Produce the message to the producer topic if it wasn't just handled by cache (that would return true)
	if c.ProducerTopic != "" && !cached {
		err := c.ProducerCallback(newRequest, c.ProducerTopic)
		if err != nil {
			fmt.Println("Error producing message:", err)
		}
	}
}

func (c *Consumer) Subscribe(topics []string) error {
	err := c.Consumer.SubscribeTopics(topics, nil)
	if err != nil {
		return err
	}
	fmt.Printf("%s consumer subscribed to topic '%s'.", c.Name, c.Topic)
	return nil
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
			msg, err := c.Consumer.ReadMessage(-1)
			if err == nil {
				fmt.Printf("Received message: %v\n", string(msg.Value))
				go c.handleMessage(msg)
			} else {
				fmt.Printf("Error reading message: %v\n", err)
			}
		}
	}
}

func (c *Consumer) CommitOffsets() {
	c.Consumer.Commit()
}

func (c *Consumer) Shutdown() error {
	c.Consumer.Close()
	return nil
}
