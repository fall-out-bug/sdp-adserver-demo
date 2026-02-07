package redis

import (
	"context"
	"testing"
	"time"
)

func TestClient_Ping(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rdbClient := NewClient(s.Addr())

	err := rdbClient.Ping(ctx)
	if err != nil {
		t.Errorf("Expected ping to succeed, got %v", err)
	}
}

func TestRateLimiter_GetRemainingRequests(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rl := NewRateLimiter(client)

	// Initially should have max requests
	remaining, err := rl.GetRemainingRequests(ctx, "192.168.1.1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if remaining != maxRequestsPerMinute {
		t.Errorf("Expected %d remaining, got %d", maxRequestsPerMinute, remaining)
	}

	// Make a request
	rl.CheckRateLimit(ctx, "192.168.1.1")

	// Should have one less
	remaining, err = rl.GetRemainingRequests(ctx, "192.168.1.1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if remaining != maxRequestsPerMinute-1 {
		t.Errorf("Expected %d remaining, got %d", maxRequestsPerMinute-1, remaining)
	}
}

func TestRateLimiter_ResetRateLimit(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rl := NewRateLimiter(client)

	// Use up some requests
	for i := 0; i < 10; i++ {
		rl.CheckRateLimit(ctx, "192.168.1.1")
	}

	// Reset
	err := rl.ResetRateLimit(ctx, "192.168.1.1")
	if err != nil {
		t.Errorf("Failed to reset: %v", err)
	}

	// Check remaining without making another request
	remaining, _ := rl.GetRemainingRequests(ctx, "192.168.1.1")
	if remaining != maxRequestsPerMinute {
		t.Errorf("Expected full remaining after reset, got %d", remaining)
	}
}

func TestDeduper_GenerateUserID(t *testing.T) {
	deduper := NewDeduper(nil)

	userID := deduper.GenerateUserID("192.168.1.1", "Mozilla/5.0")
	if userID == "" {
		t.Errorf("Expected user ID to be generated")
	}

	// Same inputs should generate same ID
	userID2 := deduper.GenerateUserID("192.168.1.1", "Mozilla/5.0")
	if userID != userID2 {
		t.Errorf("Expected same user ID for same inputs")
	}

	// Different inputs should generate different ID
	userID3 := deduper.GenerateUserID("192.168.1.2", "Mozilla/5.0")
	if userID == userID3 {
		t.Errorf("Expected different user ID for different inputs")
	}
}

func TestCache_InvalidateBanner(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	cache := NewCache(client)

	banner := &CachedBanner{
		HTML:     "<div>Test Ad</div>",
		Width:    300,
		Height:   250,
		ClickURL: "https://example.com",
	}

	// Set banner
	cache.SetBanner(ctx, "slot-1", banner)

	// Invalidate
	err := cache.InvalidateBanner(ctx, "slot-1")
	if err != nil {
		t.Errorf("Failed to invalidate: %v", err)
	}

	// Check it's gone
	retrieved, _ := cache.GetBanner(ctx, "slot-1")
	if retrieved != nil {
		t.Errorf("Expected banner to be removed after invalidation")
	}
}

func TestDeduper_ClearImpression(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	deduper := NewDeduper(client)

	slotID := "slot-1"
	userID := "user-1"

	// Mark impression
	deduper.MarkImpression(ctx, slotID, userID)

	// Clear it
	err := deduper.ClearImpression(ctx, slotID, userID)
	if err != nil {
		t.Errorf("Failed to clear: %v", err)
	}

	// Check it's gone
	exists, _ := deduper.CheckImpression(ctx, slotID, userID, 5*time.Minute)
	if exists {
		t.Errorf("Expected impression to be cleared")
	}
}

func TestRateLimiter_DifferentIPsIndependent(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rl := NewRateLimiter(client)

	// Block first IP
	for i := 0; i < maxRequestsPerMinute; i++ {
		rl.CheckRateLimit(ctx, "192.168.1.1")
	}

	// Second IP should still be allowed
	allowed, _ := rl.CheckRateLimit(ctx, "192.168.1.2")
	if !allowed {
		t.Errorf("Expected different IP to have independent rate limit")
	}
}
