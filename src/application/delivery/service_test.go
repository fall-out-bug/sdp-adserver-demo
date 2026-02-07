package delivery

import (
	"context"
	"testing"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/shopspring/decimal"
)

// Mock repositories for testing
type mockCampaignRepo struct {
	campaigns []*entities.Campaign
}

func (m *mockCampaignRepo) FindByID(ctx context.Context, id string) (*entities.Campaign, error) {
	for _, c := range m.campaigns {
		if c.ID == id {
			return c, nil
		}
	}
	return nil, nil
}

func (m *mockCampaignRepo) FindActive(ctx context.Context) ([]*entities.Campaign, error) {
	var active []*entities.Campaign
	for _, c := range m.campaigns {
		if c.IsActive() {
			active = append(active, c)
		}
	}
	return active, nil
}

func (m *mockCampaignRepo) FindBySlotID(ctx context.Context, slotID string) ([]*entities.Campaign, error) {
	return m.FindActive(ctx)
}

func (m *mockCampaignRepo) Create(ctx context.Context, campaign *entities.Campaign) error {
	return nil
}

func (m *mockCampaignRepo) Update(ctx context.Context, campaign *entities.Campaign) error {
	return nil
}

type mockBannerRepo struct {
	banners []*entities.Banner
}

func (m *mockBannerRepo) FindByID(ctx context.Context, id string) (*entities.Banner, error) {
	for _, b := range m.banners {
		if b.ID == id {
			return b, nil
		}
	}
	return nil, nil
}

func (m *mockBannerRepo) FindByCampaignID(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	var result []*entities.Banner
	for _, b := range m.banners {
		if b.CampaignID == campaignID {
			result = append(result, b)
		}
	}
	return result, nil
}

func (m *mockBannerRepo) FindActiveForCampaign(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	var result []*entities.Banner
	for _, b := range m.banners {
		if b.CampaignID == campaignID && b.IsActive() {
			result = append(result, b)
		}
	}
	return result, nil
}

func (m *mockBannerRepo) Create(ctx context.Context, banner *entities.Banner) error {
	return nil
}

func (m *mockBannerRepo) Update(ctx context.Context, banner *entities.Banner) error {
	return nil
}

type mockCache struct {
	banners map[string]*CachedBanner
}

func (m *mockCache) GetBanner(ctx context.Context, slotID string) (*CachedBanner, error) {
	return m.banners[slotID], nil
}

func (m *mockCache) SetBanner(ctx context.Context, slotID string, banner *CachedBanner) error {
	if m.banners == nil {
		m.banners = make(map[string]*CachedBanner)
	}
	m.banners[slotID] = banner
	return nil
}

func (m *mockCache) InvalidateBanner(ctx context.Context, slotID string) error {
	delete(m.banners, slotID)
	return nil
}

func TestService_DeliverBanner_CacheHit_ReturnsCached(t *testing.T) {
	// Arrange
	ctx := context.Background()
	campaignRepo := &mockCampaignRepo{}
	bannerRepo := &mockBannerRepo{}
	cache := &mockCache{
		banners: map[string]*CachedBanner{
			"slot-1": {
				HTML:     "<div>Cached Ad</div>",
				Width:    300,
				Height:   250,
				ClickURL: "https://example.com",
			},
		},
	}

	service := NewService(campaignRepo, bannerRepo, cache)

	// Act
	response, err := service.DeliverBanner(ctx, "slot-1", &DeliveryRequest{
		SlotID: "slot-1",
		IP:     "192.168.1.1",
	})

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if response == nil {
		t.Errorf("Expected response, got nil")
	}
	if response.Creative.HTML != "<div>Cached Ad</div>" {
		t.Errorf("Expected cached HTML, got %s", response.Creative.HTML)
	}
}

func TestService_DeliverBanner_NoCampaigns_ReturnsFallback(t *testing.T) {
	// Arrange
	ctx := context.Background()
	campaignRepo := &mockCampaignRepo{campaigns: []*entities.Campaign{}}
	bannerRepo := &mockBannerRepo{}
	cache := &mockCache{}

	service := NewService(campaignRepo, bannerRepo, cache)

	// Act
	response, err := service.DeliverBanner(ctx, "slot-1", &DeliveryRequest{
		SlotID: "slot-1",
		IP:     "192.168.1.1",
	})

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if response == nil {
		t.Errorf("Expected response, got nil")
	}
	if response.Fallback == nil || !response.Fallback.Enabled {
		t.Errorf("Expected fallback to be enabled")
	}
}

func TestService_DeliverBanner_ActiveCampaign_ReturnsBanner(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	campaign := &entities.Campaign{
		ID:          "cmp-1",
		Name:        "Test Campaign",
		Status:      entities.CampaignStatusActive,
		BudgetTotal: decimal.NewFromInt(1000),
		StartDate:   now.Add(-1 * time.Hour),
		EndDate:     ptrTime(now.Add(24 * time.Hour)),
		Targeting: entities.Targeting{
			Geo:     []string{"US"},
			Devices: []string{"desktop"},
		},
	}

	banner := &entities.Banner{
		ID:         "ban-1",
		CampaignID: "cmp-1",
		Name:       "Test Banner",
		Status:     entities.BannerStatusActive,
		Size:       entities.BannerSize300x250,
		HTML:       "<div>Test Ad</div>",
		ClickURL:   "https://example.com",
		Weight:     1,
	}

	campaignRepo := &mockCampaignRepo{campaigns: []*entities.Campaign{campaign}}
	bannerRepo := &mockBannerRepo{banners: []*entities.Banner{banner}}
	cache := &mockCache{}

	service := NewService(campaignRepo, bannerRepo, cache)

	// Act
	response, err := service.DeliverBanner(ctx, "slot-1", &DeliveryRequest{
		SlotID:  "slot-1",
		IP:      "192.168.1.1",
		Country: "US",
		Device:  "desktop",
	})

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if response == nil {
		t.Fatal("Expected response, got nil")
	}
	if response.Creative == nil {
		t.Fatal("Expected creative, got nil")
	}
	if response.Creative.HTML != "<div>Test Ad</div>" {
		t.Errorf("Expected HTML 'Test Ad', got %s", response.Creative.HTML)
	}
}

func TestService_DeliverBanner_TargetingMismatch_ReturnsFallback(t *testing.T) {
	// Arrange
	ctx := context.Background()
	now := time.Now()

	campaign := &entities.Campaign{
		ID:          "cmp-1",
		Name:        "Test Campaign",
		Status:      entities.CampaignStatusActive,
		BudgetTotal: decimal.NewFromInt(1000),
		StartDate:   now.Add(-1 * time.Hour),
		EndDate:     ptrTime(now.Add(24 * time.Hour)),
		Targeting: entities.Targeting{
			Geo: []string{"US"}, // Only US
		},
	}

	campaignRepo := &mockCampaignRepo{campaigns: []*entities.Campaign{campaign}}
	bannerRepo := &mockBannerRepo{}
	cache := &mockCache{}

	service := NewService(campaignRepo, bannerRepo, cache)

	// Act - Request from CA (not US)
	response, err := service.DeliverBanner(ctx, "slot-1", &DeliveryRequest{
		SlotID:  "slot-1",
		IP:      "192.168.1.1",
		Country: "CA", // Not in targeting
		Device:  "desktop",
	})

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if response == nil {
		t.Fatal("Expected response, got nil")
	}
	if response.Fallback == nil || !response.Fallback.Enabled {
		t.Errorf("Expected fallback when targeting doesn't match")
	}
}

func ptrTime(t time.Time) *time.Time {
	return &t
}
