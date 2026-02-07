package tracking

import (
	"context"
	"testing"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

type mockImpressionRepo struct {
	impressions map[string]*entities.Impression
}

func (m *mockImpressionRepo) Create(ctx context.Context, impression *entities.Impression) error {
	if m.impressions == nil {
		m.impressions = make(map[string]*entities.Impression)
	}
	m.impressions[impression.ID] = impression
	return nil
}

func (m *mockImpressionRepo) CountBySlotID(ctx context.Context, slotID string, since time.Time) (int64, error) {
	return 0, nil
}

func (m *mockImpressionRepo) Exists(ctx context.Context, slotID, userID string, within time.Duration) (bool, error) {
	return false, nil
}

func (m *mockImpressionRepo) FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error) {
	return m.impressions[impressionID], nil
}

type mockClickRepo struct {
	clicks map[string]*entities.Click
}

func (m *mockClickRepo) Create(ctx context.Context, click *entities.Click) error {
	if m.clicks == nil {
		m.clicks = make(map[string]*entities.Click)
	}
	m.clicks[click.ID] = click
	return nil
}

func (m *mockClickRepo) CountByBannerID(ctx context.Context, bannerID string, since time.Time) (int64, error) {
	return 0, nil
}

func (m *mockClickRepo) FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error) {
	return nil, nil
}

type mockBannerRepo struct {
	banners map[string]*entities.Banner
}

func (m *mockBannerRepo) FindByID(ctx context.Context, id string) (*entities.Banner, error) {
	return m.banners[id], nil
}

func (m *mockBannerRepo) Create(ctx context.Context, banner *entities.Banner) error {
	if m.banners == nil {
		m.banners = make(map[string]*entities.Banner)
	}
	m.banners[banner.ID] = banner
	return nil
}

func (m *mockBannerRepo) Update(ctx context.Context, banner *entities.Banner) error {
	return nil
}

func (m *mockBannerRepo) FindByCampaignID(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	return nil, nil
}

func (m *mockBannerRepo) FindActiveForCampaign(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	return nil, nil
}

type mockDeduper struct {
	duplicates map[string]bool
}

func (m *mockDeduper) GenerateUserID(ip, userAgent string) string {
	return ip + ":" + userAgent
}

func (m *mockDeduper) CheckImpression(ctx context.Context, slotID, userID string, within time.Duration) (bool, error) {
	if m.duplicates == nil {
		m.duplicates = make(map[string]bool)
	}
	key := slotID + ":" + userID
	return m.duplicates[key], nil
}

func (m *mockDeduper) MarkImpression(ctx context.Context, slotID, userID string) error {
	if m.duplicates == nil {
		m.duplicates = make(map[string]bool)
	}
	key := slotID + ":" + userID
	m.duplicates[key] = true
	return nil
}

func (m *mockDeduper) ClearImpression(ctx context.Context, slotID, userID string) error {
	if m.duplicates == nil {
		m.duplicates = make(map[string]bool)
	}
	delete(m.duplicates, slotID+":"+userID)
	return nil
}

func TestImpressionService_Track_Success(t *testing.T) {
	ctx := context.Background()
	impressionRepo := &mockImpressionRepo{}
	deduper := &mockDeduper{}

	service := NewImpressionService(impressionRepo, deduper)

	req := &TrackRequest{
		ImpressionID: "imp-1",
		SlotID:       "slot-1",
		BannerID:     "ban-1",
		CampaignID:   "cmp-1",
		IP:           "192.168.1.1",
		UserAgent:    "Mozilla/5.0",
		Country:      "US",
		Device:       "desktop",
	}

	response := service.Track(ctx, req)

	if !response.Success {
		t.Errorf("Expected success, got failure: %s", response.Message)
	}

	if impressionRepo.impressions == nil || impressionRepo.impressions["imp-1"] == nil {
		t.Errorf("Expected impression to be logged")
	}
}

func TestImpressionService_Track_DuplicateSkipped(t *testing.T) {
	ctx := context.Background()
	impressionRepo := &mockImpressionRepo{}
	deduper := &mockDeduper{duplicates: map[string]bool{"slot-1:192.168.1.1:Mozilla/5.0": true}}

	service := NewImpressionService(impressionRepo, deduper)

	req := &TrackRequest{
		ImpressionID: "imp-2",
		SlotID:       "slot-1",
		BannerID:     "ban-1",
		CampaignID:   "cmp-1",
		IP:           "192.168.1.1",
		UserAgent:    "Mozilla/5.0",
	}

	response := service.Track(ctx, req)

	if !response.Success {
		t.Errorf("Expected success for duplicate, got failure")
	}

	if response.Message != "duplicate impression skipped" {
		t.Errorf("Expected duplicate message, got: %s", response.Message)
	}
}

func TestClickService_TrackClick_Success(t *testing.T) {
	ctx := context.Background()

	impression := &entities.Impression{
		ID:         "imp-1",
		BannerID:   "ban-1",
		SlotID:     "slot-1",
		CampaignID: "cmp-1",
		Timestamp:  time.Now(),
		IP:         "192.168.1.1",
		Referer:    "https://example.com",
		Country:    "US",
	}

	impressionRepo := &mockImpressionRepo{
		impressions: map[string]*entities.Impression{"imp-1": impression},
	}

	clickRepo := &mockClickRepo{}

	banner := &entities.Banner{
		ID:         "ban-1",
		CampaignID: "cmp-1",
		Name:       "Test Banner",
		ClickURL:   "https://target.com",
	}

	bannerRepo := &mockBannerRepo{
		banners: map[string]*entities.Banner{"ban-1": banner},
	}

	service := NewClickService(impressionRepo, clickRepo, bannerRepo)

	response := service.TrackClick(ctx, "imp-1")

	if !response.Success {
		t.Errorf("Expected success, got failure: %s", response.Message)
	}

	if response.RedirectURL != "https://target.com" {
		t.Errorf("Expected redirect URL 'https://target.com', got: %s", response.RedirectURL)
	}

	if clickRepo.clicks == nil || len(clickRepo.clicks) == 0 {
		t.Errorf("Expected click to be logged")
	}
}

func TestClickService_TrackClick_ImpressionNotFound(t *testing.T) {
	ctx := context.Background()

	impressionRepo := &mockImpressionRepo{impressions: map[string]*entities.Impression{}}
	clickRepo := &mockClickRepo{}
	bannerRepo := &mockBannerRepo{}

	service := NewClickService(impressionRepo, clickRepo, bannerRepo)

	response := service.TrackClick(ctx, "nonexistent")

	if response.Success {
		t.Errorf("Expected failure for nonexistent impression")
	}

	if response.Message != "impression not found" {
		t.Errorf("Expected 'impression not found' message, got: %s", response.Message)
	}
}
