package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache handles banner caching with 5-minute TTL
type Cache struct {
	client *redis.Client
}

// NewCache creates a new cache instance
func NewCache(client *redis.Client) *Cache {
	return &Cache{client: client}
}

// CachedBanner represents a cached banner response
type CachedBanner struct {
	HTML       string `json:"html"`
	Width      int    `json:"width"`
	Height     int    `json:"height"`
	ClickURL   string `json:"click_url"`
	Impression string `json:"impression_url"`
	CampaignID string `json:"campaign_id"`
}

// GetBanner retrieves banner from cache
func (c *Cache) GetBanner(ctx context.Context, slotID string) (*CachedBanner, error) {
	key := fmt.Sprintf("banner:%s", slotID)

	data, err := c.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return nil, nil // Cache miss
	}
	if err != nil {
		return nil, err
	}

	var banner CachedBanner
	if err := json.Unmarshal(data, &banner); err != nil {
		return nil, err
	}

	return &banner, nil
}

// SetBanner stores banner in cache with 5-minute TTL
func (c *Cache) SetBanner(ctx context.Context, slotID string, banner *CachedBanner) error {
	key := fmt.Sprintf("banner:%s", slotID)

	data, err := json.Marshal(banner)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, key, data, 5*time.Minute).Err()
}

// InvalidateBanner removes a banner from cache
func (c *Cache) InvalidateBanner(ctx context.Context, slotID string) error {
	key := fmt.Sprintf("banner:%s", slotID)
	return c.client.Del(ctx, key).Err()
}
