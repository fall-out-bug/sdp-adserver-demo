package delivery

import (
	"context"
	"fmt"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// selectBanner selects a banner based on targeting and rotation
func (s *Service) selectBanner(ctx context.Context, campaigns []*entities.Campaign, req *DeliveryRequest) (*entities.Banner, string, error) {
	// Filter active campaigns by targeting
	var activeCampaigns []*entities.Campaign
	for _, c := range campaigns {
		if c.IsActive() && s.matchesTargeting(c.Targeting, req) {
			activeCampaigns = append(activeCampaigns, c)
		}
	}

	if len(activeCampaigns) == 0 {
		return nil, "", fmt.Errorf("no active campaigns match targeting")
	}

	// Get banners from active campaigns
	banners, err := s.getBannersForCampaigns(ctx, activeCampaigns)
	if err != nil || len(banners) == 0 {
		return nil, "", fmt.Errorf("no banners found")
	}

	// Weighted random selection
	banner := s.weightedRandomSelect(banners)
	impressionID := entities.NewImpression(banner.ID, req.SlotID, banner.CampaignID).ID

	return banner, impressionID, nil
}

// getBannersForCampaigns gets all active banners for given campaigns
func (s *Service) getBannersForCampaigns(ctx context.Context, campaigns []*entities.Campaign) ([]*entities.Banner, error) {
	var banners []*entities.Banner
	for _, c := range campaigns {
		campaignBanners, err := s.bannerRepo.FindActiveForCampaign(ctx, c.ID)
		if err != nil {
			continue
		}
		banners = append(banners, campaignBanners...)
	}
	return banners, nil
}

// weightedRandomSelect selects a banner based on weight
func (s *Service) weightedRandomSelect(banners []*entities.Banner) *entities.Banner {
	if len(banners) == 0 {
		return nil
	}
	if len(banners) == 1 {
		return banners[0]
	}

	// Calculate total weight
	totalWeight := 0
	for _, b := range banners {
		if b.Weight <= 0 {
			totalWeight++
		} else {
			totalWeight += b.Weight
		}
	}

	// Simple selection - in production use proper random
	// For now, return the first banner with highest weight
	var selected *entities.Banner
	maxWeight := 0
	for _, b := range banners {
		weight := b.Weight
		if weight <= 0 {
			weight = 1
		}
		if weight > maxWeight {
			maxWeight = weight
			selected = b
		}
	}

	if selected == nil {
		return banners[0]
	}
	return selected
}
