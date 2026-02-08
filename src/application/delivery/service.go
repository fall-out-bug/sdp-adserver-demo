package delivery

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// Service handles banner delivery with cache-first strategy
type Service struct {
	campaignRepo   repositories.CampaignRepository
	bannerRepo     repositories.BannerRepository
	demoBannerRepo repositories.DemoBannerRepository
	demoSlotRepo   repositories.DemoSlotRepository
	cache          Cache
}

// NewService creates a new delivery service
func NewService(
	campaignRepo repositories.CampaignRepository,
	bannerRepo repositories.BannerRepository,
	demoBannerRepo repositories.DemoBannerRepository,
	demoSlotRepo repositories.DemoSlotRepository,
	cache Cache,
) *Service {
	return &Service{
		campaignRepo:   campaignRepo,
		bannerRepo:     bannerRepo,
		demoBannerRepo: demoBannerRepo,
		demoSlotRepo:   demoSlotRepo,
		cache:          cache,
	}
}

// DeliverBanner delivers a banner for the given slot
func (s *Service) DeliverBanner(ctx context.Context, slotID string, req *DeliveryRequest) (*GetBannerResponse, error) {
	// 1. Check cache first
	cached, err := s.cache.GetBanner(ctx, slotID)
	if err == nil && cached != nil {
		return s.cachedToResponse(cached), nil
	}

	// 2. Try to find active campaigns for this slot
	campaigns, err := s.campaignRepo.FindBySlotID(ctx, slotID)
	if err == nil && len(campaigns) > 0 {
		// 3. Select banner from campaigns
		banner, impressionID, err := s.selectBanner(ctx, campaigns, req)
		if err == nil {
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
	}

	// 5. Fallback to demo banners if no campaigns found or selection failed
	if s.demoSlotRepo != nil {
		return s.deliverDemoBanner(ctx, slotID)
	}

	// 6. Return fallback if demo banners also not available
	return s.fallbackResponse(), nil
}

// deliverDemoBanner delivers a demo banner for the given slot
func (s *Service) deliverDemoBanner(ctx context.Context, slotID string) (*GetBannerResponse, error) {
	slot, err := s.demoSlotRepo.GetBySlotID(ctx, slotID)
	if err != nil {
		return s.fallbackResponse(), nil
	}

	if slot == nil || slot.DemoBannerID == nil {
		return s.fallbackResponse(), nil
	}

	// Explicitly load the banner since GetBySlotID doesn't preload it
	banner, err := s.demoBannerRepo.GetByID(ctx, *slot.DemoBannerID)
	if err != nil || banner == nil {
		return s.fallbackResponse(), nil
	}

	if !banner.Active {
		return s.fallbackResponse(), nil
	}

	// Extract HTML from pointer
	html := ""
	if banner.HTML != nil {
		html = *banner.HTML
	}

	// Cache the demo banner
	s.cache.SetBanner(ctx, slotID, &CachedBanner{
		HTML:       html,
		Width:      slot.Width,
		Height:     slot.Height,
		ClickURL:   "",
		Impression: "",
		CampaignID: "",
	})

	return &GetBannerResponse{
		Creative: &Creative{
			HTML:   html,
			Width:  slot.Width,
			Height: slot.Height,
		},
		Tracking: &TrackingInfo{
			Impression: "",
			Click:      "",
		},
	}, nil
}
