package tracking

import (
	"context"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// ClickService handles click tracking
type ClickService struct {
	impressionRepo repositories.ImpressionRepository
	clickRepo      repositories.ClickRepository
	bannerRepo     repositories.BannerRepository
}

// NewClickService creates a new click service
func NewClickService(
	impressionRepo repositories.ImpressionRepository,
	clickRepo repositories.ClickRepository,
	bannerRepo repositories.BannerRepository,
) *ClickService {
	return &ClickService{
		impressionRepo: impressionRepo,
		clickRepo:      clickRepo,
		bannerRepo:     bannerRepo,
	}
}

// TrackClick logs a click and returns target URL
func (s *ClickService) TrackClick(ctx context.Context, impressionID string) *ClickResponse {
	// Get impression to find banner
	impression, err := s.impressionRepo.FindByImpressionID(ctx, impressionID)
	if err != nil || impression == nil {
		return &ClickResponse{
			Success: false,
			Message: "impression not found",
		}
	}

	// Get banner to get click URL
	banner, err := s.bannerRepo.FindByID(ctx, impression.BannerID)
	if err != nil || banner == nil {
		return &ClickResponse{
			Success: false,
			Message: "banner not found",
		}
	}

	// Log click
	click := &entities.Click{
		ID:           entities.NewImpression("", "", "").ID, // Reuse UUID generator
		ImpressionID: impressionID,
		BannerID:     impression.BannerID,
		Timestamp:    time.Now(),
		IP:           impression.IP,
		Referer:      impression.Referer,
		Country:      impression.Country,
	}

	if err := s.clickRepo.Create(ctx, click); err != nil {
		// Log error but don't block redirect - still return success
		return &ClickResponse{
			RedirectURL: banner.ClickURL,
			Success:     true,
			Message:     "redirecting (click logging failed)",
		}
	}

	return &ClickResponse{
		RedirectURL: banner.ClickURL,
		Success:     true,
		Message:     "click tracked successfully",
	}
}
