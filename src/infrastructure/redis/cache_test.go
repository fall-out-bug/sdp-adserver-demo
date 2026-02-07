package redis

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
)

func setupTestRedis(t *testing.T) (*miniredis.Miniredis, *redis.Client) {
	s, err := miniredis.Run()
	if err != nil {
		t.Fatal(err)
	}

	client := redis.NewClient(&redis.Options{
		Addr: s.Addr(),
	})

	return s, client
}

func TestCache_GetSetBanner(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	cache := NewCache(client)

	banner := &CachedBanner{
		HTML:       "<div>Test Ad</div>",
		Width:      300,
		Height:     250,
		ClickURL:   "https://example.com",
		Impression: "https://tracker.example.com/i",
		CampaignID: "cmp-1",
	}

	// Test Set
	err := cache.SetBanner(ctx, "slot-1", banner)
	if err != nil {
		t.Errorf("Failed to set banner: %v", err)
	}

	// Test Get
	retrieved, err := cache.GetBanner(ctx, "slot-1")
	if err != nil {
		t.Errorf("Failed to get banner: %v", err)
	}
	if retrieved == nil {
		t.Errorf("Expected banner, got nil")
	}
	if retrieved.HTML != banner.HTML {
		t.Errorf("Expected HTML %s, got %s", banner.HTML, retrieved.HTML)
	}
}

func TestCache_MissReturnsNil(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	cache := NewCache(client)

	banner, err := cache.GetBanner(ctx, "nonexistent")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if banner != nil {
		t.Errorf("Expected nil for cache miss, got banner")
	}
}

func TestRateLimiter_CheckRateLimit(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	rl := NewRateLimiter(client)

	for i := 0; i < maxRequestsPerMinute; i++ {
		allowed, err := rl.CheckRateLimit(ctx, "192.168.1.1")
		if err != nil {
			t.Errorf("Request %d: unexpected error %v", i, err)
		}
		if !allowed {
			t.Errorf("Request %d: expected allowed", i)
		}
	}

	// Next request should be blocked
	allowed, err := rl.CheckRateLimit(ctx, "192.168.1.1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if allowed {
		t.Errorf("Expected rate limit exceeded")
	}
}

func TestDeduper_MarkAndCheck(t *testing.T) {
	s, client := setupTestRedis(t)
	defer s.Close()
	defer client.Close()

	ctx := context.Background()
	deduper := NewDeduper(client)

	slotID := "slot-1"
	userID := "user-1"

	// First check should return false (not tracked)
	exists, err := deduper.CheckImpression(ctx, slotID, userID, 5*time.Minute)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if exists {
		t.Errorf("Expected impression not to exist")
	}

	// Mark impression
	err = deduper.MarkImpression(ctx, slotID, userID)
	if err != nil {
		t.Errorf("Failed to mark impression: %v", err)
	}

	// Check again should return true
	exists, err = deduper.CheckImpression(ctx, slotID, userID, 5*time.Minute)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}
	if !exists {
		t.Errorf("Expected impression to exist")
	}
}
