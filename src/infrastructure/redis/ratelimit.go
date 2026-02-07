package redis

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	maxRequestsPerMinute = 100
	windowSize           = 60 * time.Second
)

// RateLimiter handles rate limiting using sliding window
type RateLimiter struct {
	client *redis.Client
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(client *redis.Client) *RateLimiter {
	return &RateLimiter{client: client}
}

// CheckRateLimit checks if IP is within rate limit
func (r *RateLimiter) CheckRateLimit(ctx context.Context, ip string) (bool, error) {
	key := fmt.Sprintf("rate_limit:%s", ip)

	// Get current count
	count, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return false, err
	}

	// Set expiry on first request
	if count == 1 {
		r.client.Expire(ctx, key, windowSize)
	}

	return count <= maxRequestsPerMinute, nil
}

// GetRetryAfter returns seconds to wait before retry
func (r *RateLimiter) GetRetryAfter(ctx context.Context, ip string) (int, error) {
	key := fmt.Sprintf("rate_limit:%s", ip)
	ttl, err := r.client.TTL(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	return int(ttl.Seconds()), nil
}

// ResetRateLimit resets the rate limit counter for an IP
func (r *RateLimiter) ResetRateLimit(ctx context.Context, ip string) error {
	key := fmt.Sprintf("rate_limit:%s", ip)
	return r.client.Del(ctx, key).Err()
}

// GetRemainingRequests returns the number of remaining requests for an IP
func (r *RateLimiter) GetRemainingRequests(ctx context.Context, ip string) (int, error) {
	key := fmt.Sprintf("rate_limit:%s", ip)
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return maxRequestsPerMinute, nil
	}
	if err != nil {
		return 0, err
	}

	count, err := strconv.Atoi(val)
	if err != nil {
		return 0, err
	}

	remaining := maxRequestsPerMinute - count
	if remaining < 0 {
		remaining = 0
	}

	return remaining, nil
}
