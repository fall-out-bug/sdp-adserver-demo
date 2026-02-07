package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Deduper handles impression deduplication
type Deduper struct {
	client *redis.Client
}

// NewDeduper creates a new deduper instance
func NewDeduper(client *redis.Client) *Deduper {
	return &Deduper{client: client}
}

// CheckImpression checks if impression was already tracked
func (d *Deduper) CheckImpression(ctx context.Context, slotID, userID string, within time.Duration) (bool, error) {
	key := fmt.Sprintf("dedupe:%s:%s", slotID, userID)

	exists, err := d.client.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}

	return exists > 0, nil
}

// MarkImpression marks impression as tracked
func (d *Deduper) MarkImpression(ctx context.Context, slotID, userID string) error {
	key := fmt.Sprintf("dedupe:%s:%s", slotID, userID)
	return d.client.Set(ctx, key, 1, 5*time.Minute).Err()
}

// ClearImpression removes impression tracking
func (d *Deduper) ClearImpression(ctx context.Context, slotID, userID string) error {
	key := fmt.Sprintf("dedupe:%s:%s", slotID, userID)
	return d.client.Del(ctx, key).Err()
}

// GenerateUserID creates a user identifier from IP and User-Agent
func (d *Deduper) GenerateUserID(ip, userAgent string) string {
	// Simple IP + UA hash (could be improved with cookies)
	return fmt.Sprintf("%s:%s", ip, hashUserAgent(userAgent))
}

// hashUserAgent creates a simple hash of the user agent string
func hashUserAgent(userAgent string) string {
	// Simple hash - in production use crypto/sha256
	hash := uint32(0)
	for _, c := range userAgent {
		hash = hash*31 + uint32(c)
	}
	return fmt.Sprintf("%x", hash)
}
