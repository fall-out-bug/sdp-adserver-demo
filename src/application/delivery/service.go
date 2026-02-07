package delivery

import (
	"context"
	"fmt"

	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// Service handles banner delivery with cache-first strategy
type Service struct {
	campaignRepo repositories.CampaignRepository
	bannerRepo   repositories.BannerRepository
	cache        Cache
}

// NewService creates a new delivery service
func NewService(
	campaignRepo repositories.CampaignRepository,
	bannerRepo repositories.BannerRepository,
	cache Cache,
) *Service {
	return &Service{
		campaignRepo: campaignRepo,
		bannerRepo:   bannerRepo,
		cache:        cache,
	}
}

// DeliverBanner delivers a banner for the given slot
func (s *Service) DeliverBanner(ctx context.Context, slotID string, req *DeliveryRequest) (*GetBannerResponse, error) {
	// 1. Check cache first
	cached, err := s.cache.GetBanner(ctx, slotID)
	if err == nil && cached != nil {
		return s.cachedToResponse(cached), nil
	}

	// 2. Find active campaigns for this slot
	campaigns, err := s.campaignRepo.FindBySlotID(ctx, slotID)
	if err != nil {
		return s.fallbackResponse(), fmt.Errorf("failed to find campaigns: %w", err)
	}

	// 3. Select banner from campaigns
	banner, impressionID, err := s.selectBanner(ctx, campaigns, req)
	if err != nil {
		// Return fallback on error
		return s.fallbackResponse(), nil
	}

	// 4. Cache the banner
	s.cache.SetBanner(ctx, slotID, &CachedBanner{
		HTML:       banner.HTML,
		Width:      s.extractWidth(banner.Size),
		Height:     s.extractHeight(banner.Size),
		ClickURL:   banner.ClickURL,
		Impression: s.impressionURL(impressionID),
		CampaignID: banner.CampaignID,
	})

	return s.bannerToResponse(banner, impressionID), nil
}
