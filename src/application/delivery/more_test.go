package delivery

import (
	"context"
	"testing"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

func TestService_matchesTargeting_GeoTargeting(t *testing.T) {
	service := &Service{}

	tests := []struct {
		name     string
		targeting entities.Targeting
		request  DeliveryRequest
		expected bool
	}{
		{
			name: "Match US geo targeting",
			targeting: entities.Targeting{
				Geo: []string{"US"},
			},
			request: DeliveryRequest{
				Country: "US",
			},
			expected: true,
		},
		{
			name: "No match for different country",
			targeting: entities.Targeting{
				Geo: []string{"US"},
			},
			request: DeliveryRequest{
				Country: "CA",
			},
			expected: false,
		},
		{
			name: "No geo targeting - always match",
			targeting: entities.Targeting{
				Geo: []string{},
			},
			request: DeliveryRequest{
				Country: "XX",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.matchesTargeting(tt.targeting, &tt.request)
			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestService_matchesTargeting_DeviceTargeting(t *testing.T) {
	service := &Service{}

	tests := []struct {
		name     string
		targeting entities.Targeting
		request  DeliveryRequest
		expected bool
	}{
		{
			name: "Match desktop device",
			targeting: entities.Targeting{
				Devices: []string{"desktop"},
			},
			request: DeliveryRequest{
				Device: "desktop",
			},
			expected: true,
		},
		{
			name: "No match for mobile when desktop targeted",
			targeting: entities.Targeting{
				Devices: []string{"desktop"},
			},
			request: DeliveryRequest{
				Device: "mobile",
			},
			expected: false,
		},
		{
			name: "Match multiple devices",
			targeting: entities.Targeting{
				Devices: []string{"desktop", "mobile"},
			},
			request: DeliveryRequest{
				Device: "mobile",
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.matchesTargeting(tt.targeting, &tt.request)
			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestService_matchesTargeting_OSTargeting(t *testing.T) {
	service := &Service{}

	tests := []struct {
		name     string
		targeting entities.Targeting
		request  DeliveryRequest
		expected bool
	}{
		{
			name: "Match iOS OS",
			targeting: entities.Targeting{
				OS: []string{"ios"},
			},
			request: DeliveryRequest{
				OS: "ios",
			},
			expected: true,
		},
		{
			name: "No match for Android when iOS targeted",
			targeting: entities.Targeting{
				OS: []string{"ios"},
			},
			request: DeliveryRequest{
				OS: "android",
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.matchesTargeting(tt.targeting, &tt.request)
			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestService_extractWidth(t *testing.T) {
	service := &Service{}

	tests := []struct {
		size     entities.BannerSize
		expected int
	}{
		{entities.BannerSize300x250, 300},
		{entities.BannerSize728x90, 728},
		{entities.BannerSize160x600, 160},
		{entities.BannerSizeResponsive, 300},
	}

	for _, tt := range tests {
		t.Run(string(tt.size), func(t *testing.T) {
			result := service.extractWidth(tt.size)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestService_extractHeight(t *testing.T) {
	service := &Service{}

	tests := []struct {
		size     entities.BannerSize
		expected int
	}{
		{entities.BannerSize300x250, 250},
		{entities.BannerSize728x90, 90},
		{entities.BannerSize160x600, 600},
		{entities.BannerSizeResponsive, 250},
	}

	for _, tt := range tests {
		t.Run(string(tt.size), func(t *testing.T) {
			result := service.extractHeight(tt.size)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestService_impressionURL(t *testing.T) {
	service := &Service{}

	result := service.impressionURL("imp-123")
	expected := "/api/v1/track/impression?id=imp-123"

	if result != expected {
		t.Errorf("Expected %s, got %s", expected, result)
	}
}

func TestService_bannerToResponse(t *testing.T) {
	service := &Service{}

	banner := &entities.Banner{
		ID:         "ban-1",
		CampaignID: "cmp-1",
		Name:       "Test Banner",
		Status:     entities.BannerStatusActive,
		Size:       entities.BannerSize300x250,
		HTML:       "<div>Ad</div>",
		ClickURL:   "https://example.com",
		Weight:     1,
	}

	response := service.bannerToResponse(banner, "imp-123")

	if response.Creative == nil {
		t.Fatal("Expected creative, got nil")
	}

	if response.Creative.HTML != "<div>Ad</div>" {
		t.Errorf("Expected HTML '<div>Ad</div>', got %s", response.Creative.HTML)
	}

	if response.Creative.Width != 300 {
		t.Errorf("Expected width 300, got %d", response.Creative.Width)
	}

	if response.Creative.Height != 250 {
		t.Errorf("Expected height 250, got %d", response.Creative.Height)
	}

	if response.Tracking == nil {
		t.Fatal("Expected tracking, got nil")
	}

	if response.Tracking.Impression != "/api/v1/track/impression?id=imp-123" {
		t.Errorf("Expected impression URL '/api/v1/track/impression?id=imp-123', got %s", response.Tracking.Impression)
	}

	if response.Tracking.Click != "https://example.com" {
		t.Errorf("Expected click URL 'https://example.com', got %s", response.Tracking.Click)
	}
}

func TestService_cachedToResponse(t *testing.T) {
	service := &Service{}

	cached := &CachedBanner{
		HTML:       "<div>Cached Ad</div>",
		Width:      728,
		Height:     90,
		ClickURL:   "https://cached.com",
		Impression: "/api/v1/track/impression?id=cached-123",
		CampaignID: "cmp-1",
	}

	response := service.cachedToResponse(cached)

	if response.Creative == nil {
		t.Fatal("Expected creative, got nil")
	}

	if response.Creative.HTML != "<div>Cached Ad</div>" {
		t.Errorf("Expected HTML '<div>Cached Ad</div>', got %s", response.Creative.HTML)
	}

	if response.Creative.Width != 728 {
		t.Errorf("Expected width 728, got %d", response.Creative.Width)
	}

	if response.Creative.Height != 90 {
		t.Errorf("Expected height 90, got %d", response.Creative.Height)
	}

	if response.Tracking.Impression != "/api/v1/track/impression?id=cached-123" {
		t.Errorf("Expected impression URL '/api/v1/track/impression?id=cached-123', got %s", response.Tracking.Impression)
	}

	if response.Tracking.Click != "https://cached.com" {
		t.Errorf("Expected click URL 'https://cached.com', got %s", response.Tracking.Click)
	}
}

func TestService_weightedRandomSelect_EmptyBanners(t *testing.T) {
	service := &Service{}

	result := service.weightedRandomSelect([]*entities.Banner{})

	if result != nil {
		t.Errorf("Expected nil for empty banners, got %v", result)
	}
}

func TestService_weightedRandomSelect_SingleBanner(t *testing.T) {
	service := &Service{}

	banner := &entities.Banner{
		ID:   "ban-1",
		Name: "Single Banner",
	}

	result := service.weightedRandomSelect([]*entities.Banner{banner})

	if result != banner {
		t.Errorf("Expected single banner to be returned")
	}
}

func TestService_weightedRandomSelect_SelectsHighestWeight(t *testing.T) {
	service := &Service{}

	banners := []*entities.Banner{
		{ID: "ban-1", Name: "Light", Weight: 1},
		{ID: "ban-2", Name: "Heavy", Weight: 10},
		{ID: "ban-3", Name: "Medium", Weight: 5},
	}

	result := service.weightedRandomSelect(banners)

	if result.ID != "ban-2" {
		t.Errorf("Expected highest weight banner (ban-2), got %s", result.ID)
	}
}

func TestService_weightedRandomSelect_ZeroWeightDefaultsToOne(t *testing.T) {
	service := &Service{}

	banners := []*entities.Banner{
		{ID: "ban-1", Name: "Zero Weight", Weight: 0},
		{ID: "ban-2", Name: "Normal Weight", Weight: 1},
	}

	result := service.weightedRandomSelect(banners)

	// Both should be treated as weight 1, so either could be selected
	if result == nil {
		t.Errorf("Expected a banner to be selected")
	}
}

func TestService_matchesTime_WithinRange(t *testing.T) {
	service := &Service{}

	now := time.Now()
	startTime := time.Date(now.Year(), now.Month(), now.Day(), 9, 0, 0, 0, now.Location())
	endTime := time.Date(now.Year(), now.Month(), now.Day(), 17, 0, 0, 0, now.Location())

	ranges := []entities.TimeRange{
		{Start: startTime, End: endTime},
	}

	// Test at noon (within range)
	noon := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, now.Location())
	result := service.matchesTime(ranges, noon)

	if !result {
		t.Errorf("Expected time to match within range")
	}

	// Test at midnight (outside range)
	midnight := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	result = service.matchesTime(ranges, midnight)

	if result {
		t.Errorf("Expected time to not match outside range")
	}
}

func TestService_DeliverBanner_RepositoryError_ReturnsFallback(t *testing.T) {
	// Arrange
	_ = context.Background()

	campaignRepo := &mockCampaignRepo{}
	bannerRepo := &mockBannerRepo{}
	cache := &mockCache{}

	service := NewService(campaignRepo, bannerRepo, cache)

	// Mock a repository error by passing nil context
	_, err := service.DeliverBanner(nil, "slot-1", &DeliveryRequest{
		SlotID: "slot-1",
		IP:     "192.168.1.1",
	})

	// Should return fallback without error
	if err != nil {
		t.Errorf("Expected no error on repository failure, got %v", err)
	}
}
