package tracking

import (
	"context"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// Deduper defines the interface for impression deduplication
type Deduper interface {
	GenerateUserID(ip, userAgent string) string
	CheckImpression(ctx context.Context, slotID, userID string, within time.Duration) (bool, error)
	MarkImpression(ctx context.Context, slotID, userID string) error
}

// ImpressionService handles impression tracking
type ImpressionService struct {
	impressionRepo repositories.ImpressionRepository
	deduper         Deduper
}

// NewImpressionService creates a new impression service
func NewImpressionService(
	impressionRepo repositories.ImpressionRepository,
	deduper Deduper,
) *ImpressionService {
	return &ImpressionService{
		impressionRepo: impressionRepo,
		deduper:         deduper,
	}
}

// Track logs an impression (fire-and-forget)
func (s *ImpressionService) Track(ctx context.Context, req *TrackRequest) *TrackResponse {
	// Check for deduplication
	userID := s.deduper.GenerateUserID(req.IP, req.UserAgent)
	exists, err := s.deduper.CheckImpression(ctx, req.SlotID, userID, 5*time.Minute)
	if err != nil {
		// Log error but don't block - return success with warning
		return &TrackResponse{
			Success: true,
			Message: "tracked with warning: deduplication check failed",
		}
	}

	if exists {
		// Duplicate impression, skip
		return &TrackResponse{
			Success: true,
			Message: "duplicate impression skipped",
		}
	}

	// Create impression entity
	impression := &entities.Impression{
		ID:         req.ImpressionID,
		BannerID:   req.BannerID,
		SlotID:     req.SlotID,
		CampaignID: req.CampaignID,
		Timestamp:  time.Now(),
		IP:         req.IP,
		UserAgent:  req.UserAgent,
		Referer:    req.Referer,
		Country:    req.Country,
		Device:     req.Device,
		FraudScore: 0.0,
	}

	// Log to database
	if err := s.impressionRepo.Create(ctx, impression); err != nil {
		return &TrackResponse{
			Success: false,
			Message: "failed to log impression",
		}
	}

	// Mark as tracked in dedupe cache
	if err := s.deduper.MarkImpression(ctx, req.SlotID, userID); err != nil {
		// Non-fatal error - impression was logged
		return &TrackResponse{
			Success: true,
			Message: "tracked with warning: dedupe marking failed",
		}
	}

	return &TrackResponse{
		Success: true,
		Message: "impression tracked successfully",
	}
}
