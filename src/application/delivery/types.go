package delivery

import (
	"context"
	"time"
)

// Cache defines the interface for banner caching
type Cache interface {
	GetBanner(ctx context.Context, slotID string) (*CachedBanner, error)
	SetBanner(ctx context.Context, slotID string, banner *CachedBanner) error
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

// DeliveryRequest represents a delivery request
type DeliveryRequest struct {
	SlotID    string
	IP        string
	UserAgent string
	Country   string
	Device    string
	OS        string
	Referer   string
	Timestamp time.Time
}

// GetBannerResponse represents the API response
type GetBannerResponse struct {
	Creative *Creative     `json:"creative"`
	Tracking *TrackingInfo `json:"tracking"`
	Fallback *FallbackInfo `json:"fallback,omitempty"`
}

// Creative represents banner creative
type Creative struct {
	HTML   string `json:"html"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// TrackingInfo contains tracking URLs
type TrackingInfo struct {
	Impression string `json:"impression"`
	Click      string `json:"click"`
}

// FallbackInfo represents fallback banner
type FallbackInfo struct {
	Enabled bool   `json:"enabled"`
	HTML    string `json:"html,omitempty"`
}
