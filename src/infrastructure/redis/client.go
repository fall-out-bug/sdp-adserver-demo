package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

// Client wraps the Redis client with application-specific configuration
type Client struct {
	*redis.Client
}

// NewClient creates a new Redis client with optimized settings
func NewClient(addr string) *Client {
	return &Client{
		Client: redis.NewClient(&redis.Options{
			Addr:         addr,
			DialTimeout:  5 * time.Second,
			ReadTimeout:  3 * time.Second,
			WriteTimeout: 3 * time.Second,
			PoolSize:     10,
			MinIdleConns: 2,
		}),
	}
}

// Ping checks Redis connection
func (c *Client) Ping(ctx context.Context) error {
	return c.Client.Ping(ctx).Err()
}

// Close closes the Redis connection
func (c *Client) Close() error {
	return c.Client.Close()
}
