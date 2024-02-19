package redisclient

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var (
	Client *redis.Client
	ctx    = context.Background()
)

// ConfigureRedis initializes the Redis client and performs a Ping to verify the connection.
func ConfigureRedis() error {
	// Define Redis client options
	options := &redis.Options{
		Addr:     os.Getenv("REDIS_URL"), // Assuming REDIS_URL is set in environment variables
		Password: "",                     // Redis password, if any
		DB:       0,                      // Redis database index
	}

	// Create the Redis client
	Client = redis.NewClient(options)

	// Ping the Redis server to check if it's reachable
	pong, err := Client.Ping(ctx).Result()
	if err != nil && pong != "PONG" {
		return fmt.Errorf("error connecting to Redis: %v", err)
	}
	fmt.Println("Connected to Redis server successfully.")

	return nil
}
