package delivery

import (
	"fmt"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// cachedToResponse converts cached banner to response
func (s *Service) cachedToResponse(cached *CachedBanner) *GetBannerResponse {
	return &GetBannerResponse{
		Creative: &Creative{
			HTML:   cached.HTML,
			Width:  cached.Width,
			Height: cached.Height,
		},
		Tracking: &TrackingInfo{
			Impression: cached.Impression,
			Click:      cached.ClickURL,
		},
	}
}

// bannerToResponse converts banner to response
func (s *Service) bannerToResponse(banner *entities.Banner, impressionID string) *GetBannerResponse {
	return &GetBannerResponse{
		Creative: &Creative{
			HTML:   banner.HTML,
			Width:  s.extractWidth(banner.Size),
			Height: s.extractHeight(banner.Size),
		},
		Tracking: &TrackingInfo{
			Impression: s.impressionURL(impressionID),
			Click:      banner.ClickURL,
		},
	}
}

// fallbackResponse returns a fallback banner
func (s *Service) fallbackResponse() *GetBannerResponse {
	return &GetBannerResponse{
		Fallback: &FallbackInfo{
			Enabled: true,
			HTML:    "<div>Ad unavailable</div>",
		},
	}
}

// extractWidth extracts width from banner size
func (s *Service) extractWidth(size entities.BannerSize) int {
	switch size {
	case entities.BannerSize300x250:
		return 300
	case entities.BannerSize728x90:
		return 728
	case entities.BannerSize160x600:
		return 160
	default:
		return 300
	}
}

// extractHeight extracts height from banner size
func (s *Service) extractHeight(size entities.BannerSize) int {
	switch size {
	case entities.BannerSize300x250:
		return 250
	case entities.BannerSize728x90:
		return 90
	case entities.BannerSize160x600:
		return 600
	default:
		return 250
	}
}

// impressionURL generates impression tracking URL
func (s *Service) impressionURL(impressionID string) string {
	return fmt.Sprintf("/api/v1/track/impression?id=%s", impressionID)
}
