package redis

import (
	"context"
	"testing"
	"time"
)

func TestClient_Close(t *testing.T) {
	s, _ := setupTestRedis(t)
	defer s.Close()

	ctx := context.Background()
	rdbClient := NewClient(s.Addr())

	// Ping to verify connection
	err := rdbClient.Ping(ctx)
	if err != nil {
		t.Errorf("Expected ping to succeed, got %v", err)
	}

	// Close connection
	err = rdbClient.Close()
	if err != nil {
		t.Errorf("Expected close to succeed, got %v", err)
	}

	// Ping after close should fail
	err = rdbClient.Ping(ctx)
	if err == nil {
		t.Errorf("Expected ping to fail after close")
	}
}

func TestRateLimiter_GetRetryAfter(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rl := NewRateLimiter(client)

	// Use up all requests
	for i := 0; i < maxRequestsPerMinute; i++ {
		rl.CheckRateLimit(ctx, "192.168.1.1")
	}

	// Check retry after
	retryAfter, err := rl.GetRetryAfter(ctx, "192.168.1.1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if retryAfter < 0 || retryAfter > 60 {
		t.Errorf("Expected retry after between 0 and 60 seconds, got %d", retryAfter)
	}

	// For a non-rate-limited IP, should return 0
	retryAfter2, _ := rl.GetRetryAfter(ctx, "192.168.1.2")
	if retryAfter2 < 0 {
		t.Errorf("Expected non-negative retry after, got %d", retryAfter2)
	}
}

func TestCache_InvalidJSON(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	cache := NewCache(client)

	// Manually set invalid JSON
	err := client.Set(ctx, "banner:slot-bad", "invalid json", 5*time.Minute).Err()
	if err != nil {
		t.Fatalf("Failed to set bad data: %v", err)
	}

	// GetBanner should return error for invalid JSON
	_, err = cache.GetBanner(ctx, "slot-bad")
	if err == nil {
		t.Errorf("Expected error for invalid JSON, got nil")
	}
}
